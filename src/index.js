const express = require('express');
const path = require('path');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { getWallets, saveWallets } = require('./wallets');
const bs58 = require('bs58');
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

    const wallets = getWallets();

    const newWallet = {
      publicKey,
      privateKey,
      accountName,
      operationAmount: isMaster ? null : operationAmount,
      slippage,
      fee,
      isMaster
    };

    if (isMaster) {
      wallets.master = newWallet;
    } else {
      wallets.followers.push(newWallet);
    }

    saveWallets(wallets);

    res.json({ message: 'Wallet added successfully', publicKey });
  } catch (error) {
    console.error('Error adding wallet:', error);
    res.status(400).json({ error: error.message || 'Invalid private key' });
  }
});

app.put('/api/edit-wallet/:publicKey', (req, res) => {
  const { publicKey } = req.params;
  const { accountName, operationAmount, slippage, fee } = req.body;

  const wallets = getWallets();
  let updatedWallet;

  if (wallets.master && wallets.master.publicKey === publicKey) {
    updatedWallet = wallets.master;
  } else {
    updatedWallet = wallets.followers.find(w => w.publicKey === publicKey);
  }

  if (!updatedWallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }

  updatedWallet.accountName = accountName;
  if (!updatedWallet.isMaster) {
    updatedWallet.operationAmount = operationAmount;
  }
  updatedWallet.slippage = slippage;
  updatedWallet.fee = fee;

  saveWallets(wallets);

  res.json({ message: 'Wallet updated successfully', publicKey });
});

app.delete('/api/delete-wallet/:publicKey', (req, res) => {
  const { publicKey } = req.params;

  const wallets = getWallets();

  if (wallets.master && wallets.master.publicKey === publicKey) {
    wallets.master = null;
  } else {
    wallets.followers = wallets.followers.filter(w => w.publicKey !== publicKey);
  }

  saveWallets(wallets);

  res.json({ message: 'Wallet deleted successfully' });
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
