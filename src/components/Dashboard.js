import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import WalletManager from './WalletManager';

const DashboardWrapper = styled.div`
  margin-top: 20px;
`;

function Dashboard() {
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/wallets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWallets(response.data);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  return (
    <DashboardWrapper>
      <h2>Dashboard</h2>
      <WalletManager wallets={wallets} onWalletAdded={fetchWallets} />
    </DashboardWrapper>
  );
}

export default Dashboard;
