// src/wallets.js
const fs = require('fs');
const path = require('path');

const WALLETS_FILE = path.join(__dirname, 'wallets.json');

function getWallets() {
  if (fs.existsSync(WALLETS_FILE)) {
    return JSON.parse(fs.readFileSync(WALLETS_FILE, 'utf8'));
  }
  return { master: null, followers: [] };
}

function saveWallets(wallets) {
  fs.writeFileSync(WALLETS_FILE, JSON.stringify(wallets, null, 2));
}

module.exports = { getWallets, saveWallets };
