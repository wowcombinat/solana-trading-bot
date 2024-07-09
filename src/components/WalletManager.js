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

function WalletManager({ wallets, onWalletAdded }) {
  const [privateKey, setPrivateKey] = useState('');
  const [accountName, setAccountName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/add-wallet', 
        { privateKey, accountName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPrivateKey('');
      setAccountName('');
      onWalletAdded();
    } catch (error) {
      console.error('Error adding wallet:', error);
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
