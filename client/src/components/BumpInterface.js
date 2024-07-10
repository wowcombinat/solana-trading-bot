import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const BumpWrapper = styled.div`
  background-color: ${props => props.theme.cardBackground};
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid ${props => props.theme.borderColor};
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid ${props => props.theme.borderColor};
`;

const Button = styled.button`
  background-color: ${props => props.theme.primary};
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
`;

const BumpInterface = ({ wallets }) => {
  const [selectedWallet, setSelectedWallet] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [bumpAmount, setBumpAmount] = useState('');

  const handleBump = async () => {
    try {
      const response = await axios.post('/api/bump', {
        walletPublicKey: selectedWallet,
        tokenAddress,
        bumpAmount: parseFloat(bumpAmount)
      });
      console.log(response.data);
      alert('Bump instructions generated successfully!');
    } catch (error) {
      console.error('Error during bump:', error);
      alert('Failed to perform bump');
    }
  };

  return (
    <BumpWrapper>
      <h2>Bump Token</h2>
      <Select value={selectedWallet} onChange={(e) => setSelectedWallet(e.target.value)}>
        <option value="">Select Wallet</option>
        {wallets.map(wallet => (
          <option key={wallet.public_key} value={wallet.public_key}>
            {wallet.account_name}
          </option>
        ))}
      </Select>
      <Input
        type="text"
        placeholder="Token Address"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Bump Amount (in SOL)"
        value={bumpAmount}
        onChange={(e) => setBumpAmount(e.target.value)}
      />
      <Button onClick={handleBump}>Bump</Button>
    </BumpWrapper>
  );
};

export default BumpInterface;
