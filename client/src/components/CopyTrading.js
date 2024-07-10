import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const CopyTradingWrapper = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin: 20px 0;
`;

const Title = styled.h2`
  color: ${props => props.theme.primary};
  font-size: 24px;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.text};
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.text};
`;

const Button = styled.button`
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${props => props.theme.secondary};
  }
`;

const CopyTrading = ({ wallets }) => {
  const [masterWallet, setMasterWallet] = useState('');
  const [followers, setFollowers] = useState([]);
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/copy-trade', {
        masterWallet,
        followers,
        amount: parseFloat(amount)
      });
      alert('Copy trade executed successfully');
    } catch (error) {
      console.error('Error executing copy trade:', error);
      alert('Failed to execute copy trade: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <CopyTradingWrapper>
      <Title>Copy Trading</Title>
      <Form onSubmit={handleSubmit}>
        <Select
          value={masterWallet}
          onChange={(e) => setMasterWallet(e.target.value)}
          required
        >
          <option value="">Select Master Wallet</option>
          {wallets.filter(w => w.is_master).map(wallet => (
            <option key={wallet.public_key} value={wallet.public_key}>
              {wallet.account_name}
            </option>
          ))}
        </Select>
        <div>
          {wallets.filter(w => !w.is_master).map(wallet => (
            <label key={wallet.public_key}>
              <input
                type="checkbox"
                checked={followers.includes(wallet.public_key)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFollowers([...followers, wallet.public_key]);
                  } else {
                    setFollowers(followers.filter(f => f !== wallet.public_key));
                  }
                }}
              />
              {wallet.account_name}
            </label>
          ))}
        </div>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to trade"
          required
        />
        <Button type="submit">Execute Copy Trade</Button>
      </Form>
    </CopyTradingWrapper>
  );
};

export default CopyTrading;
