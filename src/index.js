// src/index.js
const express = require('express');
const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Подключение к Solana
const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Solana Trading Bot is running');
});

// Эндпоинт для добавления кошелька
app.post('/add-wallet', (req, res) => {
  // TODO: Реализовать добавление кошелька
  res.json({ message: 'Wallet added successfully' });
});

// Эндпоинт для получения баланса кошелька
app.get('/balance/:address', async (req, res) => {
  try {
    const publicKey = new PublicKey(req.params.address);
    const balance = await connection.getBalance(publicKey);
    res.json({ balance: balance / 1e9 }); // Конвертируем lamports в SOL
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
