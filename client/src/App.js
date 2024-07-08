import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import WalletManager from './components/WalletManager';
import MotivationalBanner from './components/MotivationalBanner';

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #000;
    color: #00ff00;
    font-family: 'Courier New', monospace;
  }
`;

const AppWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff, 0 0 40px #00ffff;
`;

function App() {
  return (
    <>
      <GlobalStyle />
      <AppWrapper>
        <Title>Solana Trading Bot</Title>
        <MotivationalBanner />
        <WalletManager />
      </AppWrapper>
    </>
  );
}

export default App;
