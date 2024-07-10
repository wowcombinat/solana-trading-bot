import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bs58 from 'bs58';
import { SolanaTracker } from "solana-swap";
import dotenv from 'dotenv';
import crypto from 'crypto';
import * as bip39 from 'bip39';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('No token provided');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

const decryptPrivateKey = (encryptedPrivateKey, iv, password) => {
  const key = crypto.scryptSync(password, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
  let privateKey = decipher.update(encryptedPrivateKey, 'hex', 'utf8');
  privateKey += decipher.final('utf8');
  return privateKey;
};

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user', authenticateToken, (req, res) => {
  res.json({ username: req.user.username });
});

app.get('/api/wallets', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM wallets WHERE username = $1', [req.user.username]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/add-wallet', authenticateToken, async (req, res) => {
  const { privateKey, accountName, isMaster } = req.body;
  
  if (!privateKey) {
    return res.status(400).json({ error: 'Private key is required' });
  }

  try {
    const decodedPrivateKey = bs58.decode(privateKey);
    
    if (decodedPrivateKey.length !== 64) {
      throw new Error('Invalid private key length');
    }

    const keypair = Keypair.fromSecretKey(decodedPrivateKey);
    const publicKey = keypair.publicKey.toString();

    const existingWallet = await pool.query('SELECT * FROM wallets WHERE public_key = $1', [publicKey]);
    if (existingWallet.rows.length > 0) {
      return res.status(400).json({ error: 'Wallet with this public key already exists' });
    }

    await pool.query(
      'INSERT INTO wallets (username, public_key, private_key, account_name, is_master) VALUES ($1, $2, $3, $4, $5)',
      [req.user.username, publicKey, privateKey, accountName, isMaster]
    );

    res.json({ message: 'Wallet added successfully', publicKey });
  } catch (error) {
    console.error('Error adding wallet:', error);
    res.status(400).json({ error: error.message || 'Invalid private key' });
  }
});

app.post('/api/create-wallet', authenticateToken, async (req, res) => {
  const { accountName, isMaster, password } = req.body;
  
  try {
    const mnemonic = bip39.generateMnemonic();
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const keypair = Keypair.fromSeed(seed.slice(0, 32));
    const publicKey = keypair.publicKey.toString();
    const privateKey = bs58.encode(keypair.secretKey);

    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(password, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encryptedPrivateKey = cipher.update(privateKey, 'utf8', 'hex');
    encryptedPrivateKey += cipher.final('hex');

    const mnemonicCipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encryptedMnemonic = mnemonicCipher.update(mnemonic, 'utf8', 'hex');
    encryptedMnemonic += mnemonicCipher.final('hex');

    await pool.query(
      'INSERT INTO wallets (username, public_key, private_key, mnemonic, account_name, is_master, iv) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [req.user.username, publicKey, encryptedPrivateKey, encryptedMnemonic, accountName, isMaster, iv.toString('hex')]
    );

    res.json({ message: 'Wallet created successfully', publicKey });
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

app.post('/api/get-wallet-details', authenticateToken, async (req, res) => {
  const { publicKey, password } = req.body;

  try {
    const result = await pool.query('SELECT private_key, mnemonic, iv FROM wallets WHERE public_key = $1 AND username = $2', [publicKey, req.user.username]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const { private_key: encryptedPrivateKey, mnemonic: encryptedMnemonic, iv } = result.rows[0];

    const key = crypto.scryptSync(password, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    let privateKey = decipher.update(encryptedPrivateKey, 'hex', 'utf8');
    privateKey += decipher.final('utf8');

    const mnemonicDecipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    let mnemonic = mnemonicDecipher.update(encryptedMnemonic, 'hex', 'utf8');
    mnemonic += mnemonicDecipher.final('utf8');

    res.json({ privateKey, mnemonic });
  } catch (error) {
    console.error('Error getting wallet details:', error);
    res.status(500).json({ error: 'Failed to get wallet details' });
  }
});

app.delete('/api/delete-wallet/:publicKey', authenticateToken, async (req, res) => {
  const { publicKey } = req.params;

  try {
    const result = await pool.query('DELETE FROM wallets WHERE public_key = $1 AND username = $2', [publicKey, req.user.username]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({ message: 'Wallet deleted successfully' });
  } catch (error) {
    console.error('Error deleting wallet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/balance/:address', authenticateToken, async (req, res) => {
  try {
    const publicKey = new PublicKey(req.params.address);
    const balance = await connection.getBalance(publicKey);
    const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    });

    const tokenBalances = await Promise.all(tokenAccounts.value.map(async (tokenAccount) => {
      const accountInfo = await connection.getTokenAccountBalance(tokenAccount.pubkey);
      return {
        mint: tokenAccount.account.data.parsed.info.mint,
        amount: accountInfo.value.uiAmount,
        decimals: accountInfo.value.decimals
      };
    }));

    res.json({ solBalance: balance / 1e9, tokenBalances });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(400).json({ error: error.message });
  }
});

const SOL_ADDRESS = "So11111111111111111111111111111111111111112";

app.post('/api/swap', authenticateToken, async (req, res) => {
  const { fromToken, toToken, amount, walletPublicKey, password } = req.body;

  try {
    const walletResult = await pool.query('SELECT private_key, iv FROM wallets WHERE public_key = $1 AND username = $2', [walletPublicKey, req.user.username]);
    
    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const { private_key: encryptedPrivateKey, iv } = walletResult.rows[0];

    const privateKey = decryptPrivateKey(encryptedPrivateKey, iv, password);
    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
    const solanaTracker = new SolanaTracker(keypair, process.env.SOLANA_RPC_URL);

    const swapResponse = await solanaTracker.getSwapInstructions(
      fromToken === 'SOL' ? SOL_ADDRESS : fromToken,
      toToken === 'SOL' ? SOL_ADDRESS : toToken,
      amount,
      1, // slippage
      walletPublicKey,
      0.0005, // priority fee
      false // Force legacy transaction for Jupiter
    );

    const swapSignature = await sendAndConfirmTransaction(connection, swapResponse.transaction, [keypair]);

    await pool.query('INSERT INTO transactions (wallet_id, signature, type, amount) VALUES ($1, $2, $3, $4)',
      [walletPublicKey, swapSignature, 'swap', amount]);

    res.json({ message: 'Swap executed successfully', signature: swapSignature });
  } catch (error) {
    console.error('Error during swap:', error);
    res.status(500).json({ error: 'Failed to perform swap' });
  }
});

app.post('/api/bump', authenticateToken, async (req, res) => {
  const { walletPublicKey, tokenAddress, bumpAmount, password } = req.body;

  try {
    const walletResult = await pool.query('SELECT private_key, iv FROM wallets WHERE public_key = $1 AND username = $2', [walletPublicKey, req.user.username]);
    
    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const { private_key: encryptedPrivateKey, iv } = walletResult.rows[0];

    const privateKey = decryptPrivateKey(encryptedPrivateKey, iv, password);
    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
    const solanaTracker = new SolanaTracker(keypair, process.env.SOLANA_RPC_URL);

    const buyResponse = await solanaTracker.getSwapInstructions(
      SOL_ADDRESS,
      tokenAddress,
      bumpAmount,
      1, // slippage
      walletPublicKey,
      0.0005, // priority fee
      false // Force legacy transaction for Jupiter
    );

    const buySignature = await sendAndConfirmTransaction(connection, buyResponse.transaction, [keypair]);

    await pool.query('INSERT INTO transactions (wallet_id, signature, type, amount) VALUES ($1, $2, $3, $4)',
      [walletPublicKey, buySignature, 'bump_buy', bumpAmount]);

    const sellResponse = await solanaTracker.getSwapInstructions(
      tokenAddress,
      SOL_ADDRESS,
      bumpAmount,
      1, // slippage
      walletPublicKey,
      0.0005, // priority fee
      false // Force legacy transaction for Jupiter
    );

    const sellSignature = await sendAndConfirmTransaction(connection, sellResponse.transaction, [keypair]);

    await pool.query('INSERT INTO transactions (wallet_id, signature, type, amount) VALUES ($1, $2, $3, $4)',
      [walletPublicKey, sellSignature, 'bump_sell', bumpAmount]);

    res.json({ message: 'Bump executed successfully', buySignature, sellSignature });
  } catch (error) {
    console.error('Error during bump:', error);
    res.status(500).json({ error: 'Failed to perform bump' });
  }
});

app.post('/api/set-master-wallet', authenticateToken, async (req, res) => {
  const { publicKey } = req.body;

  try {
    await pool.query('UPDATE wallets SET is_master = false WHERE username = $1', [req.user.username]);
    await pool.query('UPDATE wallets SET is_master = true WHERE public_key = $1 AND username = $2', [publicKey, req.user.username]);
    res.json({ message: 'Master wallet set successfully' });
  } catch (error) {
    console.error('Error setting master wallet:', error);
    res.status(500).json({ error: 'Failed to set master wallet' });
  }
});

app.post('/api/copy-trade', authenticateToken, async (req, res) => {
  const { masterPublicKey, amount, destinationAddress, password } = req.body;

  try {
    const masterWallet = await pool.query('SELECT * FROM wallets WHERE public_key = $1 AND is_master = true AND username = $2', [masterPublicKey, req.user.username]);
    if (masterWallet.rows.length === 0) {
      return res.status(400).json({ error: 'Master wallet not found' });
    }

    const followerWallets = await pool.query('SELECT * FROM wallets WHERE is_master = false AND username = $1', [req.user.username]);

    const masterPrivateKey = decryptPrivateKey(masterWallet.rows[0].private_key, masterWallet.rows[0].iv, password);
    const masterKeypair = Keypair.fromSecretKey(bs58.decode(masterPrivateKey));
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: masterKeypair.publicKey,
        toPubkey: new PublicKey(destinationAddress),
        lamports: amount * LAMPORTS_PER_SOL
      })
    );
    
    const signature = await sendAndConfirmTransaction(connection, transaction, [masterKeypair]);
    
    await pool.query('INSERT INTO transactions (wallet_id, signature, type, amount) VALUES ($1, $2, $3, $4)',
      [masterPublicKey, signature, 'copy_trade_master', amount]);

    for (const follower of followerWallets.rows) {
      const followerPrivateKey = decryptPrivateKey(follower.private_key, follower.iv, password);
      const followerKeypair = Keypair.fromSecretKey(bs58.decode(followerPrivateKey));
      
      const followerTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: followerKeypair.publicKey,
          toPubkey: new PublicKey(destinationAddress),
          lamports: amount * LAMPORTS_PER_SOL
        })
      );
      
      const followerSignature = await sendAndConfirmTransaction(connection, followerTransaction, [followerKeypair]);
      
      await pool.query('INSERT INTO transactions (wallet_id, signature, type, amount) VALUES ($1, $2, $3, $4)',
        [follower.public_key, followerSignature, 'copy_trade_follower', amount]);
    }

    res.json({ message: 'Copy trade executed successfully' });
  } catch (error) {
    console.error('Error executing copy trade:', error);
    res.status(500).json({ error: 'Failed to execute copy trade' });
  }
});

app.get('/api/transaction-history', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions WHERE wallet_id IN (SELECT public_key FROM wallets WHERE username = $1) ORDER BY timestamp DESC', [req.user.username]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('subscribe', async (data) => {
    if (data.walletAddress) {
      const publicKey = new PublicKey(data.walletAddress);
      
      connection.onLogs(publicKey, (logs) => {
        socket.emit('transaction', { type: 'transaction', data: logs });
      }, 'confirmed');
    }
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
