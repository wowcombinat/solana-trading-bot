import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

const AppWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff, 0 0 40px #00ffff;
`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
  };

  return (
    <AppWrapper>
      <Title>Solana Trading Bot</Title>
      {isAuthenticated ? (
        <Dashboard handleLogout={handleLogout} />
      ) : (
        <Auth setIsAuthenticated={setIsAuthenticated} />
      )}
    </AppWrapper>
  );
}

export default App;
