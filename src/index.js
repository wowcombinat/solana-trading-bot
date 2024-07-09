const express = require('express');
const path = require('path');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bs58 = require('bs58');
const bip39 = require('bip39');
require('dotenv').config();

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

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
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

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, username });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/wallets', authenticateToken, async (req, res) => {
  console.log('Fetching wallets for user:', req.user.username);
  try {
    const result = await pool.query('SELECT * FROM wallets WHERE username = $1', [req.user.username]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/add-wallet', authenticateToken, async (req, res) => {
  console.log('Adding wallet for user:', req.user.username);
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

    await pool.query(
      'INSERT INTO wallets (username, public_key, private_key, account_name, is_master) VALUES ($1, $2, $3, $4, $5)',
      [req.user.username, publicKey, privateKey, accountName, isMaster]
    );

    console.log('Wallet added successfully:', { publicKey, accountName, isMaster });
    res.json({ message: 'Wallet added successfully', publicKey });
  } catch (error) {
    console.error('Error adding wallet:', error);
    res.status(400).json({ error: error.message || 'Invalid private key' });
  }
});

app.get('/api/balance/:address', authenticateToken, async (req, res) => {
  try {
    const publicKey = new PublicKey(req.params.address);
    const balance = await connection.getBalance(publicKey);
    res.json({ balance: balance / 1e9 }); // Convert lamports to SOL
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/create-wallet', authenticateToken, (req, res) => {
  try {
    const mnemonic = bip39.generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const keypair = Keypair.fromSeed(seed.slice(0, 32));

    res.json({
      publicKey: keypair.publicKey.toString(),
      privateKey: bs58.encode(keypair.secretKey),
      mnemonic: mnemonic
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

app.post('/api/execute-trade', authenticateToken, async (req, res) => {
  const { masterWalletId, amount } = req.body;

  try {
    // Здесь должна быть логика выполнения торговой операции
    // Например, отправка транзакции в сеть Solana

    // Получаем все follower-кошельки
    const followerWallets = await pool.query(
      'SELECT * FROM wallets WHERE username = $1 AND is_master = false',
      [req.user.username]
    );

    // Выполняем ту же операцию для каждого follower-кошелька
    for (const wallet of followerWallets.rows) {
      // Здесь должна быть логика выполнения той же операции для follower-кошелька
      console.log(`Executing trade for follower wallet: ${wallet.public_key}`);
    }

    res.json({ message: 'Trade executed successfully' });
  } catch (error) {
    console.error('Error executing trade:', error);
    res.status(500).json({ error: 'Failed to execute trade' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
