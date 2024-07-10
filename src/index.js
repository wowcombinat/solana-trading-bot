// src/index.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Connection, PublicKey, Keypair, Transaction } from "@solana/web3.js";
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bs58 from 'bs58';
import { SolanaTracker } from "solana-swap";
import dotenv from 'dotenv';
import crypto from 'crypto';
import * as bip39 from 'bip39';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
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

app.post('/api/create-wallet', authenticateToken, async (req, res) => {
  const { accountName, isMaster, password, operationAmount, slippage, fee } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

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
      'INSERT INTO wallets (username, public_key, private_key, mnemonic, account_name, is_master, operation_amount, slippage, fee, iv) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [req.user.username, publicKey, encryptedPrivateKey, encryptedMnemonic, accountName, isMaster, operationAmount, slippage, fee, iv.toString('hex')]
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
  const { fromToken, toToken, amount, walletPublicKey } = req.body;

  try {
    const walletResult = await pool.query('SELECT private_key, iv FROM wallets WHERE public_key = $1 AND username = $2', [walletPublicKey, req.user.username]);
    
    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const { private_key: encryptedPrivateKey, iv } = walletResult.rows[0];

    // Здесь нужно добавить логику для расшифровки приватного ключа
    // Используйте тот же пароль, который использовался при создании кошелька
    // const key = crypto.scryptSync(password, 'salt', 32);
    // const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    // let privateKey = decipher.update(encryptedPrivateKey, 'hex', 'utf8');
    // privateKey += decipher.final('utf8');

    // Затем используйте расшифрованный приватный ключ для создания keypair
    // const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));

    // const solanaTracker = new SolanaTracker(keypair, process.env.SOLANA_RPC_URL);

    // const swapResponse = await solanaTracker.getSwapInstructions(
    //   fromToken === 'SOL' ? SOL_ADDRESS : fromToken,
    //   toToken === 'SOL' ? SOL_ADDRESS : toToken,
    //   amount,
    //   1, // slippage
    //   walletPublicKey,
    //   0.0005, // priority fee
    //   false // Force legacy transaction for Jupiter
    // );

    // Здесь вы бы отправили транзакцию, но для безопасности мы просто возвращаем инструкции
    res.json({ message: 'Swap instructions generated', instructions: 'swapResponse' });
  } catch (error) {
    console.error('Error during swap:', error);
    res.status(500).json({ error: 'Failed to perform swap' });
  }
});

app.post('/api/bump', authenticateToken, async (req, res) => {
  const { walletPublicKey, tokenAddress, bumpAmount } = req.body;

  try {
    const walletResult = await pool.query('SELECT private_key, iv FROM wallets WHERE public_key = $1 AND username = $2', [walletPublicKey, req.user.username]);
    
    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const { private_key: encryptedPrivateKey, iv } = walletResult.rows[0];

    // Здесь нужно добавить логику для расшифровки приватного ключа
    // Используйте тот же пароль, который использовался при создании кошелька
    // const key = crypto.scryptSync(password, 'salt', 32);
    // const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    // let privateKey = decipher.update(encryptedPrivateKey, 'hex', 'utf8');
    // privateKey += decipher.final('utf8');

    // Затем используйте расшифрованный приватный ключ для создания keypair
    // const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));

    // const solanaTracker = new SolanaTracker(keypair, process.env.SOLANA_RPC_URL);

    // // Perform buy
    // const buyResponse = await solanaTracker.getSwapInstructions(
    //   SOL_ADDRESS,
    //   tokenAddress,
    //   bumpAmount,
    //   1, // slippage
    //   walletPublicKey,
    //   0.0005, // priority fee
    //   false // Force legacy transaction for Jupiter
    // );

    // // Perform sell
    // const sellResponse = await solanaTracker.getSwapInstructions(
    //   tokenAddress,
    //   SOL_ADDRESS,
    //   bumpAmount,
    //   1, // slippage
    //   walletPublicKey,
    //   0.0005, // priority fee
    //   false // Force legacy transaction for Jupiter
    // );

    // Здесь вы бы отправили эти транзакции, но для безопасности мы просто возвращаем инструкции
    res.json({ message: 'Bump instructions generated', buyInstructions: 'buyResponse', sellInstructions: 'sellResponse' });
  } catch (error) {
    console.error('Error during bump:', error);
    res.status(500).json({ error: 'Failed to perform bump' });
  }
});

app.post('/api/copy-trade', authenticateToken, async (req, res) => {
  const { masterWallet, followers } = req.body;

  try {
    // Здесь должна быть логика копитрейдинга
    // Например, получение последней транзакции мастер-кошелька и её повторение для кошельков-последователей

    res.json({ message: 'Copy trade executed successfully' });
  } catch (error) {
    console.error('Error during copy trade:', error);
    res.status(500).json({ error: 'Failed to execute copy trade' });
  }
});

app.post('/api/swap-all-to-sol', authenticateToken, async (req, res) => {
  try {
    // Получаем все кошельки пользователя
    const walletsResult = await pool.query('SELECT public_key, private_key, iv FROM wallets WHERE username = $1', [req.user.username]);
    
    if (walletsResult.rows.length === 0) {
      return res.status(404).json({ error: 'No wallets found' });
    }

    const results = [];

    for (const wallet of walletsResult.rows) {
      const { public_key, private_key: encryptedPrivateKey, iv } = wallet;

      // Здесь нужно добавить логику для расшифровки приватного ключа
      // Используйте тот же пароль, который использовался при создании кошелька
      // const key = crypto.scryptSync(password, 'salt', 32);
      // const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
      // let privateKey = decipher.update(encryptedPrivateKey, 'hex', 'utf8');
      // privateKey += decipher.final('utf8');

      // Затем используйте расшифрованный приватный ключ для создания keypair
      // const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));

      // const solanaTracker = new SolanaTracker(keypair, process.env.SOLANA_RPC_URL);

      // Получаем список всех токенов в кошельке
      const tokenAccounts = await connection.getTokenAccountsByOwner(new PublicKey(public_key), {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
      });

      for (const tokenAccount of tokenAccounts.value) {
        const accountInfo = await connection.getTokenAccountBalance(tokenAccount.pubkey);
        if (accountInfo.value.uiAmount > 0) {
          // Здесь должна быть логика для обмена токена на SOL
          // const swapResponse = await solanaTracker.getSwapInstructions(
          //   tokenAccount.account.data.parsed.info.mint,
          //   SOL_ADDRESS,
          //   accountInfo.value.uiAmount,
          //   1, // slippage
          //   public_key,
          //   0.0005, // priority fee
          //   false // Force legacy transaction for Jupiter
          // );

          // Добавьте результат обмена в массив результатов
          results.push({
            wallet: public_key,
            token: tokenAccount.account.data.parsed.info.mint,
            amount: accountInfo.value.uiAmount,
            status: 'Swap instructions generated'
          });
        }
      }
    }

    res.json({ message: 'All assets swapped to SOL', results });
  } catch (error) {
    console.error('Error swapping all assets to SOL:', error);
    res.status(500).json({ error: 'Failed to swap assets to SOL' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
