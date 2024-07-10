import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import WalletManager from './WalletManager';
import CopyTrading from './CopyTrading';
import SwapAllToSol from './SwapAllToSol';
import TransactionHistory from './TransactionHistory';
import LiveTransactions from './LiveTransactions';

const DashboardWrapper = styled.div`
  padding: 20px;
`;

const Dashboard = ({ username }) => {
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchWallets();
    fetchTransactionHistory();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await axios.get('/api/wallets');
      setWallets(response.data);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const response = await axios.get('/api/transaction-history');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
  };

  return (
    <DashboardWrapper>
      <h1>Welcome, {username}!</h1>
      <SwapAllToSol />
      <WalletManager wallets={wallets} onWalletUpdated={fetchWallets} />
      <CopyTrading wallets={wallets} />
      <TransactionHistory transactions={transactions} />
      <LiveTransactions wallets={wallets} />
    </DashboardWrapper>
  );
};

export default Dashboard;
