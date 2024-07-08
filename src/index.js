// src/index.js
const express = require('express');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { getWallets, saveWallets } = require('./wallets');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Solana Trading Bot is running');
});

app.post('/add-wallet', (req, res) => {
  const { privateKey, isMaster } = req.body;
  
  if (!privateKey) {
    return res.status(400).json({ error: 'Private key is required' });
  }

  try {
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
    res.status(400).json({ error: 'Invalid private key' });
  }
});

app.get('/wallets', (req, res) => {
  const wallets = getWallets();
  res.json(wallets);
});

app.get('/balance/:address', async (req, res) => {
  try {
    const publicKey = new PublicKey(req.params.address);
    const balance = await connection.getBalance(publicKey);
    res.json({ balance: balance / 1e9 }); // Convert lamports to SOL
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Функция для мониторинга транзакций мастер-кошелька
async function monitorMasterWallet() {
  const wallets = getWallets();
  if (!wallets.master) {
    console.log('No master wallet set');
    return;
  }

  const masterPublicKey = new PublicKey(wallets.master.publicKey);

  console.log(`Monitoring transactions for master wallet: ${wallets.master.publicKey}`);

  connection.onLogs(masterPublicKey, (logs) => {
    console.log('New transaction detected:', logs);
    // Здесь будет логика для обработки транзакций и выполнения действий на follower-кошельках
  }, 'confirmed');
}

monitorMasterWallet();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
