import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const ImportWrapper = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  max-width: 400px;
  margin: 20px auto;
`;

const Title = styled.h2`
  color: ${props => props.theme.primary};
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 6px;
  font-size: 16px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.text};
`;

const Button = styled.button`
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${props => props.theme.secondary};
  }
`;

const ImportPrivateKey = ({ onImport }) => {
  const [privateKey, setPrivateKey] = useState('');
  const [accountName, setAccountName] = useState('');
  const [password, setPassword] = useState('');

  const handleImport = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/import-wallet', { privateKey, accountName, password });
      alert('Wallet imported successfully');
      onImport();
    } catch (error) {
      console.error('Error importing wallet:', error);
      alert('Failed to import wallet: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <ImportWrapper>
      <Title>Import Existing Wallet</Title>
      <Form onSubmit={handleImport}>
        <Input
          type="text"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          placeholder="Enter private key"
          required
        />
        <Input
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="Enter account name"
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password for encryption"
          required
        />
        <Button type="submit">Import Wallet</Button>
      </Form>
    </ImportWrapper>
  );
};

export default ImportPrivateKey;
