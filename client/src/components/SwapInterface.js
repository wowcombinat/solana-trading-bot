// client/src/components/SwapInterface.js
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

const SOL_ADDRESS = "So11111111111111111111111111111111111111112";

const SwapInterface = ({ wallets }) => {
  const [fromToken, setFromToken] = useState('SOL');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [customFromToken, setCustomFromToken] = useState('');
  const [customToToken, setCustomToToken] = useState('');

  const handleSwap = async () => {
    try {
      const fromTokenAddress = fromToken === 'SOL' ? SOL_ADDRESS : customFromToken;
      const toTokenAddress = toToken === 'SOL' ? SOL_ADDRESS : customToToken;
      const response = await axios.post('/api/swap', {
        fromToken: fromTokenAddress,
        toToken: toTokenAddress,
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
      <Select value={fromToken} onChange={(e) => setFromToken(e.target.value)}>
        <option value="SOL">SOL</option>
        <option value="custom">Custom Token</option>
      </Select>
      {fromToken === 'custom' && (
        <Input
          type="text"
          placeholder="From Token Address"
          value={customFromToken}
          onChange={(e) => setCustomFromToken(e.target.value)}
        />
      )}
      <Select value={toToken} onChange={(e) => setToToken(e.target.value)}>
        <option value="SOL">SOL</option>
        <option value="custom">Custom Token</option>
      </Select>
      {toToken === 'custom' && (
        <Input
          type="text"
          placeholder="To Token Address"
          value={customToToken}
          onChange={(e) => setCustomToToken(e.target.value)}
        />
      )}
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
