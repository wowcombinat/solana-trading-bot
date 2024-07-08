import React, { useState } from 'react';
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
  margin-right: 10px;
  border-radius: 5px;
  width: 80%;
`;

const Button = styled.button`
  background-color: #00ffff;
  color: #1a1a1a;
  border: none;
  padding: 10px 20px;
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

const WalletManager = () => {
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddWallet = async () => {
    try {
      setError('');
      setSuccess('');
      const response = await fetch('/api/add-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ privateKey, isMaster: false }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(`Wallet added successfully. Public key: ${data.publicKey}`);
        setPrivateKey('');
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error adding wallet:', error);
      setError('Failed to add wallet. Please try again.');
    }
  };

  return (
    <WalletWrapper>
      <h2>Wallet Manager</h2>
      <Input
        type="text"
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
        placeholder="Enter private key (base58 encoded)"
      />
      <Button onClick={handleAddWallet}>Add Wallet</Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
    </WalletWrapper>
  );
};

export default WalletManager;
