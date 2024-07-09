import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import WalletManager from './WalletManager';
import TradingInterface from './TradingInterface';
import WalletCreator from './WalletCreator';
import AssetDisplay from './AssetDisplay';

const DashboardWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const Card = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Dashboard = ({ username }) => {
  const [wallets, setWallets] = useState([]);
  const [assets, setAssets] = useState({});

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await axios.get('/api/wallets');
      setWallets(response.data);
      fetchAssets(response.data);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  const fetchAssets = async (walletsList) => {
    const assetsData = {};
    for (const wallet of walletsList) {
      try {
        const response = await axios.get(`/api/balance/${wallet.public_key}`);
        assetsData[wallet.public_key] = response.data.balance;
      } catch (error) {
        console.error(`Error fetching balance for ${wallet.public_key}:`, error);
      }
    }
    setAssets(assetsData);
  };

  return (
    <DashboardWrapper>
      <Card>
        <WalletManager wallets={wallets} onWalletAdded={fetchWallets} />
      </Card>
      <Card>
        <TradingInterface wallets={wallets} />
      </Card>
      <Card>
        <WalletCreator onWalletCreated={fetchWallets} />
      </Card>
      <Card>
        <AssetDisplay wallets={wallets} assets={assets} />
      </Card>
    </DashboardWrapper>
  );
};

export default Dashboard;
