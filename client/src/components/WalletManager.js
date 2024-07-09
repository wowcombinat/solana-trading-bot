// client/src/components/WalletManager.js
import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import WalletDetails from './WalletDetails';

const WalletManagerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  color: ${props => props.theme.error};
`;

function WalletManager({ wallets, onWalletAdded, onWalletDeleted }) {
  const [privateKey, setPrivateKey] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isMaster, setIsMaster] = useState(false);
  const [error, setError] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/add-wallet', { privateKey, accountName, isMaster });
      setPrivateKey('');
      setAccountName('');
      setIsMaster(false);
      onWalletAdded();
    } catch (error) {
      console.error('Error adding wallet:', error);
      setError(error.response?.data?.error || 'Failed to add wallet');
    }
  };

  const handleCreateWallet = async () => {
    try {
      const response = await axios.post('/api/create-wallet', { accountName, isMaster });
      console.log('Wallet created:', response.data);
      setAccountName('');
      setIsMaster(false);
      onWalletAdded();
    } catch (error) {
      console.error('Error creating wallet:', error);
      setError(error.response?.data?.error || 'Failed to create wallet');
    }
  };

  const handleDelete = async (publicKey) => {
    try {
      await axios.delete(`/api/delete-wallet/${publicKey}`);
      onWalletDeleted();
    } catch (error) {
      console.error('Error deleting wallet:', error);
      setError(error.response?.data?.error || 'Failed to delete wallet');
    }
  };

  return (
    <WalletManagerWrapper>
      <h3>Add New Wallet</h3>
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
        <label>
          <input
            type="checkbox"
            checked={isMaster}
            onChange={(e) => setIsMaster(e.target.checked)}
          />
          Master Wallet
        </label>
        <Button type="submit">Add Wallet</Button>
      </Form>
      <Button onClick={handleCreateWallet}>Create New Wallet</Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <h3>Your Wallets</h3>
      <WalletList>
        {wallets.map((wallet) => (
          <WalletItem key={wallet.public_key}>
            <span>{wallet.account_name} - {wallet.public_key}</span>
            <Button onClick={() => setSelectedWallet(wallet.public_key)}>View Details</Button>
            <Button onClick={() => handleDelete(wallet.public_key)}>Delete</Button>
          </WalletItem>
        ))}
      </WalletList>
      {selectedWallet && <WalletDetails publicKey={selectedWallet} />}
    </WalletManagerWrapper>
  );
}

export default WalletManager;
