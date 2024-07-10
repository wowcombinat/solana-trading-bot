// src/App.js
import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme, GlobalStyles } from './themes';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import WalletManager from './components/WalletManager';
import CreateWallet from './components/CreateWallet';
import CopyTrading from './components/CopyTrading';
import SwapToSol from './components/SwapToSol';
import axios from 'axios';

const AppWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState('light');
  const [username, setUsername] = useState('');
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (token && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
      fetchWallets();
    }
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

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername('');
    setWallets([]);
  };

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyles />
      <AppWrapper>
        <Header 
          isAuthenticated={isAuthenticated} 
          handleLogout={handleLogout}
          toggleTheme={toggleTheme}
          theme={theme}
          username={username}
        />
        {isAuthenticated ? (
          <>
            <Dashboard username={username} />
            <WalletManager wallets={wallets} onWalletUpdated={fetchWallets} />
            <CreateWallet onWalletCreated={fetchWallets} />
            <CopyTrading wallets={wallets} />
            <SwapToSol />
          </>
        ) : (
          <Auth setIsAuthenticated={setIsAuthenticated} setUsername={setUsername} />
        )}
      </AppWrapper>
    </ThemeProvider>
  );
}

export default App;
