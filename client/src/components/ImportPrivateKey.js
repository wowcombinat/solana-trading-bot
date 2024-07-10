import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const ImportWrapper = styled.div`
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  max-width: 400px;
  margin: 20px auto;
`;

const Title = styled.h2`
  color: #1098fc;
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
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  font-size: 16px;
`;

const Button = styled.button`
  background-color: #1098fc;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0d8aec;
  }
`;

const ImportPrivateKey = ({ onImport }) => {
  const [password, setPassword] = useState('');

  const handleImport = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/import-wallet', { password });
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
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        <Button type="submit">Import Wallet</Button>
      </Form>
    </ImportWrapper>
  );
};

export default ImportPrivateKey;
