import React, { useState, useContext } from 'react';
import axios from 'axios';
import styled, { ThemeContext } from 'styled-components';
import ViewPrivateKey from './ViewPrivateKey';
import ImportPrivateKey from './ImportPrivateKey';

const WalletManagerWrapper = styled.div`
  background-color: ${props => props.theme.cardBackground};
  color: ${props => props.theme.text};
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  max-width: 800px;
  margin: 20px auto;
`;

const Title = styled.h2`
  color: ${props => props.theme.primary};
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const Th = styled.th`
  background-color: ${props => props.theme.tableHeader};
  color: ${props => props.theme.text};
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid ${props => props.theme.borderColor};
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid ${props => props.theme.borderColor};
`;

const Button = styled.button`
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-right: 8px;

  &:hover {
    background-color: ${props => props.theme.secondary};
  }
`;

const DeleteButton = styled(Button)`
  background-color: ${props => props.theme.error};
  &:hover {
    background-color: ${props => props.theme.errorHover};
  }
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  background-color: ${props => props.theme.cardBackground};
  padding: 20px;
  border-radius: 6px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.text};
`;

const WalletManager = ({ wallets, onWalletUpdated }) => {
  const [editingWallet, setEditingWallet] = useState(null);
  const theme = useContext(ThemeContext);

  const handleToggleBot = async (publicKey, isActive) => {
    try {
      console.log('Toggling bot:', { publicKey, isActive });
      const response = await axios.post('/api/toggle-bot', { publicKey, isActive });
      console.log('Toggle bot response:', response.data);
      if (response.status === 200) {
        onWalletUpdated();
      } else {
        throw new Error('Failed to toggle bot');
      }
    } catch (error) {
      console.error('Error toggling bot:', error);
      alert('Failed to toggle bot: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdateWallet = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('/api/update-wallet', editingWallet);
      if (response.status === 200) {
        setEditingWallet(null);
        onWalletUpdated();
      } else {
        throw new Error('Failed to update wallet');
      }
    } catch (error) {
      console.error('Error updating wallet:', error);
      alert('Failed to update wallet: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteWallet = async (publicKey) => {
    if (window.confirm('Are you sure you want to delete this wallet?')) {
      try {
        const response = await axios.delete(`/api/delete-wallet/${publicKey}`);
        if (response.status === 200) {
          onWalletUpdated();
        } else {
          throw new Error('Failed to delete wallet');
        }
      } catch (error) {
        console.error('Error deleting wallet:', error);
        alert('Failed to delete wallet: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  return (
    <WalletManagerWrapper>
      <Title>Wallet Manager</Title>
      <ImportPrivateKey onImport={onWalletUpdated} />
      <Table>
        <thead>
          <tr>
            <Th>Account Name</Th>
            <Th>Public Key</Th>
            <Th>Operation Amount</Th>
            <Th>Slippage</Th>
            <Th>Fee</Th>
            <Th>Is Master</Th>
            <Th>Is Active</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {wallets.map((wallet) => (
            <tr key={wallet.public_key}>
              <Td>{wallet.account_name}</Td>
              <Td>{wallet.public_key.slice(0, 6)}...{wallet.public_key.slice(-4)}</Td>
              <Td>{wallet.operation_amount}</Td>
              <Td>{wallet.slippage}</Td>
              <Td>{wallet.fee}</Td>
              <Td>{wallet.is_master ? 'Yes' : 'No'}</Td>
              <Td>{wallet.is_active ? 'Active' : 'Inactive'}</Td>
              <Td>
                <Button onClick={() => handleToggleBot(wallet.public_key, !wallet.is_active)}>
                  {wallet.is_active ? 'Stop' : 'Start'}
                </Button>
                <Button onClick={() => setEditingWallet(wallet)}>Edit</Button>
                <DeleteButton onClick={() => handleDeleteWallet(wallet.public_key)}>Delete</DeleteButton>
                <ViewPrivateKey publicKey={wallet.public_key} />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {editingWallet && (
        <EditForm onSubmit={handleUpdateWallet}>
          <Input
            type="text"
            value={editingWallet.account_name}
            onChange={(e) => setEditingWallet({...editingWallet, account_name: e.target.value})}
            placeholder="Account Name"
          />
          <Input
            type="number"
            value={editingWallet.operation_amount}
            onChange={(e) => setEditingWallet({...editingWallet, operation_amount: e.target.value})}
            placeholder="Operation Amount"
          />
          <Input
            type="number"
            value={editingWallet.slippage}
            onChange={(e) => setEditingWallet({...editingWallet, slippage: e.target.value})}
            placeholder="Slippage"
          />
          <Input
            type="number"
            value={editingWallet.fee}
            onChange={(e) => setEditingWallet({...editingWallet, fee: e.target.value})}
            placeholder="Fee"
          />
          <label>
            <input
              type="checkbox"
              checked={editingWallet.is_master}
              onChange={(e) => setEditingWallet({...editingWallet, is_master: e.target.checked})}
            />
            Is Master
          </label>
          <Button type="submit">Save</Button>
          <Button type="button" onClick={() => setEditingWallet(null)}>Cancel</Button>
        </EditForm>
      )}
    </WalletManagerWrapper>
  );
};

export default WalletManager;
