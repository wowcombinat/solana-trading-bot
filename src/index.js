const express = require('express');
const path = require('path');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { getWallets, saveWallets } = require('./wallets');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');

app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('/api/wallets', (req, res) => {
  const wallets = getWallets();
  res.json(wallets);
});

app.post('/api/add-wallet', (req, res) => {
  const { privateKey, isMaster } = req.body;
  
  if (!privateKey) {
    return res.status(400).json({ error: 'Private key is required' });
  }

  try {
    // Проверка формата privateKey (должен быть шестнадцатеричной строкой)
    if (!/^[0-9a-fA-F]+$/.test(privateKey) || privateKey.length !== 64) {
      throw new Error('Invalid private key format');
    }

    const keypair = Keypair.fromSecretKey(Buffer.from(privateKey, 'hex'));
    const publicKey = keypair.publicKey.toString();

    const wallets = getWallets();

    if (isMaster) {
      wallets.master = { publicKey, privateKey };
    } else {
      wallets.followers.push({ publicKey, privateKey });
    }

    saveWallets(wallets);

    res.json({ message: 'Wallet added successfully', publicKey });
  } catch (error) {
    console.error('Error adding wallet:', error);
    res.status(400).json({ error: error.message || 'Invalid private key' });
  }
});

app.get('/api/balance/:address', async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
