import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const WalletManagerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background-color: ${props => props.theme.primary};
  color: white;
  padding: 10px;
  text-align: left;
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid ${props => props.theme.borderColor};
`;

const Button = styled.button`
  padding: 5px 10px;
  background-color: ${props => props.theme.secondary};
  color: white;
  border: none;
  cursor: pointer;
`;

const WalletManager = ({ wallets, onWalletAdded, onWalletDeleted }) => {
  const handleDelete = async (publicKey) => {
    try {
      await axios.delete(`/api/delete-wallet/${publicKey}`);
      onWalletDeleted();
    } catch (error) {
      console.error('Error deleting wallet:', error);
    }
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Account Name,Public Key,Operation Amount,Slippage,Fee,Is Master\n"
      + wallets.map(w => `${w.account_name},${w.public_key},${w.operation_amount},${w.slippage},${w.fee},${w.is_master}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "wallets.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <WalletManagerWrapper>
      <h3>Your Wallets</h3>
      <Button onClick={handleExportCSV}>Export to CSV</Button>
      <Table>
        <thead>
          <tr>
            <Th>Account Name</Th>
            <Th>Public Key</Th>
            <Th>Operation Amount</Th>
            <Th>Slippage</Th>
            <Th>Fee</Th>
            <Th>Is Master</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {wallets.map((wallet) => (
            <tr key={wallet.public_key}>
              <Td>{wallet.account_name}</Td>
              <Td>{wallet.public_key}</Td>
              <Td>{wallet.operation_amount}</Td>
              <Td>{wallet.slippage}</Td>
              <Td>{wallet.fee}</Td>
              <Td>{wallet.is_master ? 'Yes' : 'No'}</Td>
              <Td>
                <Button onClick={() => handleDelete(wallet.public_key)}>Delete</Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </WalletManagerWrapper>
  );
};

export default WalletManager;
