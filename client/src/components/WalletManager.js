import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 300px;
  margin: 20px 0;
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 5px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #00ffff;
  color: black;
  border: none;
  cursor: pointer;
`;

const WalletList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const WalletItem = styled.li`
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
`;

const ErrorMessage = styled.p`
  color: red;
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
    <div>
      <h3>Add Wallet</h3>
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

      <h3>Your Wallets</h3>
      <WalletList>
        {wallets.map((wallet) => (
          <WalletItem key={wallet.public_key}>
            {wallet.account_name} - {wallet.public_key}
          </WalletItem>
        ))}
      </WalletList>
    </div>
  );
}

export default WalletManager;
