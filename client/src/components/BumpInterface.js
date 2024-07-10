import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const BumpWrapper = styled.div`
  background-color: ${props => props.theme.cardBackground};
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Input = styled.input`
  padding: 5px;
`;

const Select = styled.select`
  padding: 5px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  cursor: pointer;
`;

const BumpInterface = ({ wallets }) => {
  const [selectedWallet, setSelectedWallet] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [bumpAmount, setBumpAmount] = useState('');

  const handleBump = async (e) => {
    e.preventDefault();
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
      alert('Failed to perform bump: ' + error.response?.data?.error || error.message);
    }
  };

  return (
    <BumpWrapper>
      <h3>Bump Token</h3>
      <Form onSubmit={handleBump}>
        <Select value={selectedWallet} onChange={(e) => setSelectedWallet(e.target.value)} required>
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
          required
        />
        <Input
          type="number"
          placeholder="Bump Amount (in SOL)"
          value={bumpAmount}
          onChange={(e) => setBumpAmount(e.target.value)}
          required
        />
        <Button type="submit">Bump</Button>
      </Form>
    </BumpWrapper>
  );
};

export default BumpInterface;
