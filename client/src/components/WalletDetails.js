// client/src/components/WalletDetails.js
import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const DetailsWrapper = styled.div`
  margin-top: 20px;
`;

const Input = styled.input`
  margin-right: 10px;
`;

const Button = styled.button`
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
`;

const WalletDetails = ({ publicKey }) => {
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [mnemonic, setMnemonic] = useState('');

  const handleGetDetails = async () => {
    try {
      const response = await axios.post('/api/get-wallet-details', { publicKey, password });
      setPrivateKey(response.data.privateKey);
      setMnemonic(response.data.mnemonic);
    } catch (error) {
      console.error('Error getting wallet details:', error);
      alert('Failed to get wallet details. Please check your password.');
    }
  };

  return (
    <DetailsWrapper>
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
      />
      <Button onClick={handleGetDetails}>Get Details</Button>
      {privateKey && (
        <div>
          <p>Private Key: {privateKey}</p>
          <p>Mnemonic: {mnemonic}</p>
        </div>
      )}
    </DetailsWrapper>
  );
};

export default WalletDetails;
