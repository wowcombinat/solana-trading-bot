import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const SwapWrapper = styled.div`
  background-color: ${props => props.theme.cardBackground};
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Input = styled.input`
  padding: 5px;
`;

const Select = styled.select`
  padding: 5px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  cursor: pointer;
`;

const SwapInterface = ({ wallets }) => {
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');

  const handleSwap = async (e) => {
    e.preventDefault();
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
      alert('Failed to perform swap: ' + error.response?.data?.error || error.message);
    }
  };

  return (
    <SwapWrapper>
      <h3>Swap Tokens</h3>
      <Form onSubmit={handleSwap}>
        <Select value={selectedWallet} onChange={(e) => setSelectedWallet(e.target.value)} required>
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
          required
        />
        <Input
          type="text"
          placeholder="To Token Address"
          value={toToken}
          onChange={(e) => setToToken(e.target.value)}
          required
        />
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Button type="submit">Swap</Button>
      </Form>
    </SwapWrapper>
  );
};

export default SwapInterface;
