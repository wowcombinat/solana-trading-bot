const express = require('express');
const path = require('path');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bs58 = require('bs58');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');

// Подключение к PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Middleware для проверки аутентификации
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
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
    res.json({ token });
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
    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
  const { privateKey, accountName, operationAmount, slippage, fee, isMaster } = req.body;
  
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
      'INSERT INTO wallets (username, public_key, private_key, account_name, operation_amount, slippage, fee, is_master) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [req.user.username, publicKey, privateKey, accountName, operationAmount, slippage, fee, isMaster]
    );

    res.json({ message: 'Wallet added successfully', publicKey });
  } catch (error) {
    console.error('Error adding wallet:', error);
    res.status(400).json({ error: error.message || 'Invalid private key' });
  }
});

app.put('/api/edit-wallet/:publicKey', authenticateToken, async (req, res) => {
  const { publicKey } = req.params;
  const { accountName, operationAmount, slippage, fee } = req.body;

  try {
    const result = await pool.query(
      'UPDATE wallets SET account_name = $1, operation_amount = $2, slippage = $3, fee = $4 WHERE public_key = $5 AND username = $6 RETURNING *',
      [accountName, operationAmount, slippage, fee, publicKey, req.user.username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({ message: 'Wallet updated successfully', wallet: result.rows[0] });
  } catch (error) {
    console.error('Error updating wallet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/delete-wallet/:publicKey', authenticateToken, async (req, res) => {
  const { publicKey } = req.params;

  try {
    const result = await pool.query('DELETE FROM wallets WHERE public_key = $1 AND username = $2 RETURNING *', [publicKey, req.user.username]);

    if (result.rows.length === 0) {
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
    res.json({ balance: balance / 1e9 }); // Convert lamports to SOL
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Инициализация базы данных
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) REFERENCES users(username),
        public_key VARCHAR(44) UNIQUE NOT NULL,
        private_key VARCHAR(88) NOT NULL,
        account_name VARCHAR(100),
        operation_amount DECIMAL,
        slippage DECIMAL,
        fee DECIMAL,
        is_master BOOLEAN
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initDatabase();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
