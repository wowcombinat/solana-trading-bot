import React from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Button = styled.button`
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  margin: 20px 0;
`;

const SwapToSol = () => {
  const handleSwapAll = async () => {
    try {
      await axios.post('/api/swap-all-to-sol');
      alert('All assets swapped to SOL successfully');
    } catch (error) {
      console.error('Error swapping to SOL:', error);
      alert('Failed to swap assets to SOL: ' + error.response?.data?.error || error.message);
    }
  };

  return (
    <div>
      <h3>Swap All Assets to SOL</h3>
      <Button onClick={handleSwapAll}>Swap All to SOL</Button>
    </div>
  );
};

export default SwapToSol;
