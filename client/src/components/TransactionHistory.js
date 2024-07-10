import React from 'react';
import styled from 'styled-components';

const TransactionHistoryWrapper = styled.div`
  margin-top: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background-color: ${props => props.theme.tableHeader};
  color: ${props => props.theme.text};
  padding: 10px;
  text-align: left;
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid ${props => props.theme.borderColor};
`;

const TransactionHistory = ({ transactions }) => {
  return (
    <TransactionHistoryWrapper>
      <h2>Transaction History</h2>
      <Table>
        <thead>
          <tr>
            <Th>Wallet</Th>
            <Th>Type</Th>
            <Th>Amount</Th>
            <Th>Signature</Th>
            <Th>Timestamp</Th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr key={index}>
              <Td>{tx.wallet_id}</Td>
              <Td>{tx.type}</Td>
              <Td>{tx.amount}</Td>
              <Td>{tx.signature}</Td>
              <Td>{new Date(tx.timestamp).toLocaleString()}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TransactionHistoryWrapper>
  );
};

export default TransactionHistory;
