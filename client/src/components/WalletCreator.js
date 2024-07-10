import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const WalletCreatorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h2`
  color: ${props => props.theme.primary};
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

const WalletInfo = styled.div`
  background-color: ${props => props.theme.cardBackground};
  padding: 15px;
  border-radius: 5px;
  margin-top: 15px;
`;

const InfoItem = styled.p`
  margin: 5px 0;
`;

function WalletCreator({ onWalletCreated }) {
  const [newWallet, setNewWallet] = useState(null);

  const handleCreateWallet = async () => {
    try {
      const response = await axios.post('/api/create-wallet');
      setNewWallet(response.data);
      onWalletCreated();
    } catch (error) {
      console.error('Error creating wallet:', error);
    }
  };

  return (
    <WalletCreatorWrapper>
      <Title>Create New Wallet</Title>
      <Button onClick={handleCreateWallet}>Create Wallet</Button>
      {newWallet && (
        <WalletInfo>
          <InfoItem><strong>Public Key:</strong> {newWallet.publicKey}</InfoItem>
          <InfoItem><strong>Private Key:</strong> {newWallet.privateKey}</InfoItem>
          <InfoItem><strong>Mnemonic:</strong> {newWallet.mnemonic}</InfoItem>
        </WalletInfo>
      )}
    </WalletCreatorWrapper>
  );
}

export default WalletCreator;
