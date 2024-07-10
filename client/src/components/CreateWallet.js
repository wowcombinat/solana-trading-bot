// client/src/components/CreateWallet.js
import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/create-wallet', { accountName, isMaster });
      console.log('Wallet created:', response.data);
      setAccountName('');
      setIsMaster(false);
      onWalletCreated();
    } catch (error) {
      console.error('Error creating wallet:', error);
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
