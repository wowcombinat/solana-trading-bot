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
      'INSERT INTO wallets (username, public_key, private_key, mnemonic, account_name, is_master, operation_amount, slippage, fee, iv, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [req.user.username, publicKey, encryptedPrivateKey, encryptedMnemonic, accountName, isMaster, operationAmount, slippage, fee, iv.toString('hex'), true]
    );

    res.json({ message: 'Wallet created successfully', publicKey });
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

app.post('/api/view-private-key', authenticateToken, async (req, res) => {
  const { publicKey, password } = req.body;

  try {
    const result = await pool.query('SELECT private_key, iv FROM wallets WHERE public_key = $1 AND username = $2', [publicKey, req.user.username]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const { private_key: encryptedPrivateKey, iv } = result.rows[0];

    const key = crypto.scryptSync(password, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    let privateKey = decipher.update(encryptedPrivateKey, 'hex', 'utf8');
    privateKey += decipher.final('utf8');

    res.json({ privateKey });
  } catch (error) {
    console.error('Error viewing private key:', error);
    res.status(500).json({ error: 'Failed to view private key' });
  }
});

app.post('/api/import-wallet', authenticateToken, async (req, res) => {
  const { privateKey, accountName, password } = req.body;

  try {
    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
    const publicKey = keypair.publicKey.toString();

    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(password, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encryptedPrivateKey = cipher.update(privateKey, 'utf8', 'hex');
    encryptedPrivateKey += cipher.final('hex');

    await pool.query(
      'INSERT INTO wallets (username, public_key, private_key, account_name, iv, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
      [req.user.username, publicKey, encryptedPrivateKey, accountName, iv.toString('hex'), true]
    );

    res.json({ message: 'Wallet imported successfully', publicKey });
  } catch (error) {
    console.error('Error importing wallet:', error);
    res.status(500).json({ error: 'Failed to import wallet' });
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

app.post('/api/toggle-bot', authenticateToken, async (req, res) => {
  const { publicKey, isActive } = req.body;

  try {
    console.log('Toggling bot:', { publicKey, isActive, username: req.user.username });
    const result = await pool.query(
      'UPDATE wallets SET is_active = $1 WHERE public_key = $2 AND username = $3 RETURNING *',
      [isActive, publicKey, req.user.username]
    );

    if (result.rowCount === 0) {
      console.log('Wallet not found');
      return res.status(404).json({ error: 'Wallet not found' });
    }

    console.log('Bot toggled successfully');
    res.json({ message: isActive ? 'Bot started' : 'Bot stopped', wallet: result.rows[0] });
  } catch (error) {
    console.error('Error toggling bot:', error);
    res.status(500).json({ error: 'Failed to toggle bot: ' + error.message });
  }
});

app.put('/api/update-wallet', authenticateToken, async (req, res) => {
  const { publicKey, accountName, operationAmount, slippage, fee, isMaster } = req.body;

  try {
    const result = await pool.query(
      'UPDATE wallets SET account_name = $1, operation_amount = $2, slippage = $3, fee = $4, is_master = $5 WHERE public_key = $6 AND username = $7 RETURNING *',
      [accountName, operationAmount, slippage, fee, isMaster, publicKey, req.user.username]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({ message: 'Wallet updated successfully', wallet: result.rows[0] });
  } catch (error) {
    console.error('Error updating wallet:', error);
    res.status(500).json({ error: 'Failed to update wallet' });
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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
