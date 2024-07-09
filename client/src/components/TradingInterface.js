import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const TradingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h2`
  color: ${props => props.theme.primary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid ${props => props.theme.borderColor};
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const Select = styled.select`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid ${props => props.theme.borderColor};
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const Button = styled.button`
  background-color: ${props => props.theme.secondary};
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${props => props.theme.primary};
  }
`;

const TradingInterface = ({ wallets }) => {
  const [amount, setAmount] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');

  const handleTrade = async (e) => {
    e.preventDefault();
    try {
      // Здесь должна быть логика для выполнения торговой операции
      console.log(`Trading ${amount} SOL from wallet ${selectedWallet}`);
      // Пример запроса к API (нужно реализовать соответствующий эндпоинт на сервере)
      // await axios.post('/api/trade', { amount, walletId: selectedWallet });
    } catch (error) {
      console.error('Error during trade:', error);
    }
  };

  return (
    <TradingWrapper>
      <Title>Trading Interface</Title>
      <Form onSubmit={handleTrade}>
        <Select
          value={selectedWallet}
          onChange={(e) => setSelectedWallet(e.target.value)}
          required
        >
          <option value="">Select Wallet</option>
          {wallets.map((wallet) => (
            <option key={wallet.public_key} value={wallet.public_key}>
              {wallet.account_name} - {wallet.public_key.slice(0, 10)}...
            </option>
          ))}
        </Select>
        <Input
          type="number"
          placeholder="Amount (SOL)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Button type="submit">Execute Trade</Button>
      </Form>
    </TradingWrapper>
  );
};

export default TradingInterface;
