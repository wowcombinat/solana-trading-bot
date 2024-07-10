import React, { useState } from 'react';
import axios from 'axios';
import ViewPrivateKey from './ViewPrivateKey';
import ImportPrivateKey from './ImportPrivateKey';

const WalletManager = ({ wallets, onWalletUpdated }) => {
  const [editingWallet, setEditingWallet] = useState(null);

  const handleToggleBot = async (publicKey, isActive) => {
    try {
      await axios.post('/api/toggle-bot', { publicKey, isActive });
      onWalletUpdated();
    } catch (error) {
      console.error('Error toggling bot:', error);
      alert('Failed to toggle bot');
    }
  };

  const handleUpdateWallet = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/update-wallet', editingWallet);
      setEditingWallet(null);
      onWalletUpdated();
    } catch (error) {
      console.error('Error updating wallet:', error);
      alert('Failed to update wallet');
    }
  };

  return (
    <div>
      <h2>Wallet Manager</h2>
      <ImportPrivateKey onImport={onWalletUpdated} />
      <table>
        <thead>
          <tr>
            <th>Account Name</th>
            <th>Public Key</th>
            <th>Operation Amount</th>
            <th>Slippage</th>
            <th>Fee</th>
            <th>Is Master</th>
            <th>Is Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {wallets.map((wallet) => (
            <tr key={wallet.public_key}>
              <td>{wallet.account_name}</td>
              <td>{wallet.public_key}</td>
              <td>{wallet.operation_amount}</td>
              <td>{wallet.slippage}</td>
              <td>{wallet.fee}</td>
              <td>{wallet.is_master ? 'Yes' : 'No'}</td>
              <td>{wallet.is_active ? 'Active' : 'Inactive'}</td>
              <td>
                <button onClick={() => handleToggleBot(wallet.public_key, !wallet.is_active)}>
                  {wallet.is_active ? 'Stop Bot' : 'Start Bot'}
                </button>
                <button onClick={() => setEditingWallet(wallet)}>Edit</button>
                <ViewPrivateKey publicKey={wallet.public_key} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingWallet && (
        <form onSubmit={handleUpdateWallet}>
          <input
            type="text"
            value={editingWallet.account_name}
            onChange={(e) => setEditingWallet({...editingWallet, account_name: e.target.value})}
          />
          <input
            type="number"
            value={editingWallet.operation_amount}
            onChange={(e) => setEditingWallet({...editingWallet, operation_amount: e.target.value})}
          />
          <input
            type="number"
            value={editingWallet.slippage}
            onChange={(e) => setEditingWallet({...editingWallet, slippage: e.target.value})}
          />
          <input
            type="number"
            value={editingWallet.fee}
            onChange={(e) => setEditingWallet({...editingWallet, fee: e.target.value})}
          />
          <label>
            <input
              type="checkbox"
              checked={editingWallet.is_master}
              onChange={(e) => setEditingWallet({...editingWallet, is_master: e.target.checked})}
            />
            Is Master
          </label>
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditingWallet(null)}>Cancel</button>
        </form>
      )}
    </div>
  );
};

export default WalletManager;
