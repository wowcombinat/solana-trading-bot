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
    } catch (error)
