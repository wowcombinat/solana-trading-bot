import React from 'react';
import axios from 'axios';
import styled from 'styled-components';

const SwapButton = styled.button`
  background-color: ${props => props.theme.accent};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${props => props.theme.accentHover};
  }
`;

const SwapAllToSol = () => {
  const handleSwap = async () => {
    try {
      const response = await axios.post('/api/swap-all-to-sol');
      alert('All assets swapped to SOL successfully');
    } catch (error) {
      console.error('Error swapping to SOL:', error);
      alert('Failed to swap assets to SOL: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <SwapButton onClick={handleSwap}>Swap All to SOL</SwapButton>
  );
};

export default SwapAllToSol;
