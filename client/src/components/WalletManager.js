import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const WalletWrapper = styled.div`
  background-color: #1a1a1a;
  color: #00ffff;
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
`;

const Input = styled.input`
  background-color: #2a2a2a;
  color: #00ffff;
  border: none;
  padding: 10px;
  margin: 5px 0;
  border-radius: 5px;
  width: 100%;
`;

const Select = styled.select`
  background-color: #2a2a2a;
  color: #00ffff;
  border: none;
  padding: 10px;
  margin: 5px 0;
  border-radius: 5px;
  width: 100%;
`;

const Button = styled.button`
  background-color: #00ffff;
  color: #1a1a1a;
  border: none;
  padding: 10px 20px;
  margin-top: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #ff00ff;
    box-shadow: 0 0 10px #ff00ff;
  }
`;

const ErrorMessage = styled.div`
  color: #ff0000;
  margin-top: 10px;
`;

const SuccessMessage = styled.div`
  color: #00ff00;
  margin-top: 10px;
`;

const WalletList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const WalletItem = styled.li`
  background-color: #2a2a2a;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
`;

const WalletManager = () => {
  const [wallets, setWallets] = useState([]);
  const [privateKey, setPrivateKey] = useState('');
  const [accountName, setAccountName] = useState('');
  const [operationAmount, setOperationAmount] = useState('');
  const [slippage, setSlippage] = useState('1');
  const [fee, setFee] = useState('0.00005');
  const [accountType, setAccountType] = useState('follower');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingWallet, setEditingWallet] = useState(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await fetch('/api/wallets');
      const data = await response.json();
      setWallets(data.master ? [data.master, ...data.followers] : data.followers);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  const handleAddWallet = async () => {
    try {
      setError('');
      setSuccess('');
      const response = await fetch('/api/add-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          privateKey,
          accountName,
          operationAmount: accountType === 'master' ? null : operationAmount,
          slippage,
          fee,
          isMaster: accountType === 'master'
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(`Wallet added successfully. Public key: ${data.publicKey}`);
        resetForm();
        fetchWallets();
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error adding wallet:', error);
      setError('Failed to add wallet. Please try again.');
    }
  };

  const handleEditWallet = async () => {
    try {
      setError('');
      setSuccess('');
      const response = await fetch(`/api/edit-wallet/${editingWallet.publicKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountName,
          operationAmount: accountType === 'master' ? null : operationAmount,
          slippage,
          fee,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(`Wallet updated successfully.`);
        resetForm();
        fetchWallets();
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error editing wallet:', error);
      setError('Failed to edit wallet. Please try again.');
    }
  };

  const handleDeleteWallet = async (publicKey) => {
    try {
      const response = await fetch(`/api/delete-wallet/${publicKey}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSuccess(`Wallet deleted successfully.`);
        fetchWallets();
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (error) {
      console.error('Error deleting wallet:', error);
      setError('Failed to delete wallet. Please try again.');
    }
  };

  const resetForm = () => {
    setPrivateKey('');
    setAccountName('');
    setOperationAmount('');
    setSlippage('1');
    setFee('0.00005');
    setAccountType('follower');
    setEditingWallet(null);
  };

  return (
    <WalletWrapper>
      <h2>Wallet Manager</h2>
      {!editingWallet && (
        <Input
          type="text"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          placeholder="Enter private key (base58 encoded)"
        />
      )}
      <Input
        type="text"
        value={accountName}
        onChange={(e) => setAccountName(e.target.value)}
        placeholder="Account Name"
      />
      {accountType !== 'master' && (
        <Input
          type="number"
          value={operationAmount}
          onChange={(e) => setOperationAmount(e.target.value)}
          placeholder="Operation Amount (SOL)"
        />
      )}
      <Input
        type="number"
        value={slippage}
        onChange={(e) => setSlippage(e.target.value)}
        placeholder="Slippage (%)"
      />
      <Input
        type="number"
        value={fee}
        onChange={(e) => setFee(e.target.value)}
        placeholder="Fee (SOL)"
      />
      {!editingWallet && (
        <Select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
        >
          <option value="follower">Follower (Copy Trader)</option>
          <option value="master">Master (Main Account)</option>
        </Select>
      )}
      {editingWallet ? (
        <Button onClick={handleEditWallet}>Update Wallet</Button>
      ) : (
        <Button onClick={handleAddWallet}>Add Wallet</Button>
      )}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <h3>Wallet List</h3>
      <WalletList>
        {wallets.map((wallet) => (
          <WalletItem key={wallet.publicKey}>
            <div>Name: {wallet.accountName}</div>
            <div>Public Key: {wallet.publicKey}</div>
            <div>Type: {wallet.isMaster ? 'Master' : 'Follower'}</div>
            {!wallet.isMaster && <div>Operation Amount: {wallet.operationAmount} SOL</div>}
            <div>Slippage: {wallet.slippage}%</div>
            <div>Fee: {wallet.fee} SOL</div>
            <Button onClick={() => setEditingWallet(wallet)}>Edit</Button>
            <Button onClick={() => handleDeleteWallet(wallet.publicKey)}>Delete</Button>
          </WalletItem>
        ))}
      </WalletList>
    </WalletWrapper>
  );
};

export default WalletManager;
