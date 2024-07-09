import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const WalletManagerWrapper = styled.div`
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

const WalletList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const WalletItem = styled.li`
  background-color: ${props => props.theme.cardBackground};
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme.accent};
`;

function WalletManager({ wallets, onWalletAdded }) {
  const [privateKey, setPrivateKey] = useState('');
  const [accountName, setAccountName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/add-wallet', { privateKey, accountName });
      setPrivateKey('');
      setAccountName('');
      onWalletAdded();
    } catch (error) {
      console.error('Error adding wallet:', error);
      setError(error.response?.data?.error || 'Failed to add wallet');
    }
  };

  return (
    <WalletManagerWrapper>
      <Title>Wallet Manager</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Private Key"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Account Name"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
        />
        <Button type="submit">Add Wallet</Button>
      </Form>
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <WalletList>
        {wallets.map((wallet) => (
          <WalletItem key={wallet.public_key}>
            <span>{wallet.account_name}</span>
            <span>{wallet.public_key.slice(0, 10)}...</span>
          </WalletItem>
        ))}
      </WalletList>
    </WalletManagerWrapper>
  );
}

export default WalletManager;
