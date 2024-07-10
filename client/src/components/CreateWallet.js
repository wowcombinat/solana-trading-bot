// src/components/CreateWallet.js
import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 300px;
  margin: 20px 0;
`;

const Input = styled.input`
  padding: 5px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  cursor: pointer;
`;

const CreateWallet = ({ onWalletCreated }) => {
  const [accountName, setAccountName] = useState('');
  const [isMaster, setIsMaster] = useState(false);
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/create-wallet', 
        { accountName, isMaster, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Wallet created:', response.data);
      setAccountName('');
      setIsMaster(false);
      setPassword('');
      onWalletCreated();
    } catch (error) {
      console.error('Error creating wallet:', error);
      alert('Failed to create wallet: ' + error.response?.data?.error || error.message);
    }
  };

  return (
    <div>
      <h3>Create New Wallet</h3>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="Account Name"
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Encryption Password"
          required
        />
        <label>
          <input
            type="checkbox"
            checked={isMaster}
            onChange={(e) => setIsMaster(e.target.checked)}
          />
          Master Wallet
        </label>
        <Button type="submit">Create Wallet</Button>
      </Form>
    </div>
  );
};

export default CreateWallet;
