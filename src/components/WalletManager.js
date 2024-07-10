// src/components/WalletManager.js
import React from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background-color: #f2f2f2;
  padding: 12px;
  text-align: left;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #ddd;
`;

const Button = styled.button`
  padding: 5px 10px;
  background-color: #f44336;
  color: white;
  border: none;
  cursor: pointer;
`;

const ExportButton = styled(Button)`
  background-color: #4CAF50;
  margin-bottom: 10px;
`;

const WalletManager = ({ wallets, onWalletUpdated }) => {
  const handleDelete = async (publicKey) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/delete-wallet/${publicKey}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onWalletUpdated();
    } catch (error) {
      console.error('Error deleting wallet:', error);
      alert('Failed to delete wallet: ' + error.response?.data?.error || error.message);
    }
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Login,Public Key,Balances,Copy Trading Amount,Type\n"
      + wallets.map(w => `${w.account_name},${w.public_key},${w.balances},${w.copy_trading_amount},${w.is_master ? 'Master' : 'Follower'}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "wallets.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      <h2>Wallet Manager</h2>
      <ExportButton onClick={handleExportCSV}>Export to CSV</ExportButton>
      <Table>
        <thead>
          <tr>
            <Th>Login</Th>
            <Th>Public Key</Th>
            <Th>Balances</Th>
            <Th>Copy Trading Amount</Th>
            <Th>Type</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {wallets.map((wallet) => (
            <tr key={wallet.public_key}>
              <Td>{wallet.account_name}</Td>
              <Td>{wallet.public_key}</Td>
              <Td>{wallet.balances}</Td>
              <Td>{wallet.copy_trading_amount}</Td>
              <Td>{wallet.is_master ? 'Master' : 'Follower'}</Td>
              <Td>
                <Button onClick={() => handleDelete(wallet.public_key)}>Delete</Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default WalletManager;
