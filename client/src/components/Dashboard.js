import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import WalletManager from './WalletManager';
import CopyTrading from './CopyTrading';

const DashboardWrapper = styled.div`
  padding: 20px;
`;

const Dashboard = ({ username }) => {
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await axios.get('/api/wallets');
      setWallets(response.data);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  return (
    <DashboardWrapper>
      <h1>Welcome, {username}!</h1>
      <WalletManager wallets={wallets} onWalletUpdated={fetchWallets} />
      <CopyTrading wallets={wallets} />
    </DashboardWrapper>
  );
};

export default Dashboard;
