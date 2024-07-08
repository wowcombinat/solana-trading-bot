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
  text-align: center
