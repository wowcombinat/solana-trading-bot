import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import WalletManager from './WalletManager';

const DashboardWrapper = styled.div`
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #ff4444;
  color: white;
  border: none;
  cursor: pointer;
  margin-bottom: 10px;
`;

function Dashboard({ setIsAuthenticated }) {
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
  };

  return (
    <DashboardWrapper>
      <Button onClick={handleLogout}>Logout</Button>
      <h2>Dashboard</h2>
      <WalletManager wallets={wallets} onWalletAdded={fetchWallets} />
    </DashboardWrapper>
  );
}

export default Dashboard;
