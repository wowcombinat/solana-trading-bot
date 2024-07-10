import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const SwapWrapper = styled.div`
  background-color: ${props => props.theme.cardBackground};
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid ${props => props.theme.borderColor};
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid ${props => props.theme.borderColor};
`;

const Button = styled.button`
  background-color: ${props => props.theme.primary};
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
`;

const SwapInterface = ({ wallets }) => {
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');

  const handleSwap = async () => {
    try {
      const response = await axios.post('/api/swap', {
        fromToken,
        toToken,
        amount: parseFloat(amount),
        walletPublicKey: selectedWallet
      });
      console.log(response.data);
      alert('Swap instructions generated successfully!');
    } catch (error) {
      console.error('Error during swap:', error);
      alert('Failed to perform swap');
    }
  };

  return (
    <SwapWrapper>
      <h2>Swap Tokens</h2>
      <Select value={selectedWallet} onChange={(e) => setSelectedWallet(e.target.value)}>
        <option value="">Select Wallet</option>
        {wallets.map(wallet => (
          <option key={wallet.public_key} value={wallet.public_key}>
            {wallet.account_name}
          </option>
        ))}
      </Select>
      <Input
        type="text"
        placeholder="From Token Address"
        value={fromToken}
        onChange={(e) => setFromToken(e.target.value)}
      />
      <Input
        type="text"
        placeholder="To Token Address"
        value={toToken}
        onChange={(e) => setToToken(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button onClick={handleSwap}>Swap</Button>
    </SwapWrapper>
  );
};

export default SwapInterface;
