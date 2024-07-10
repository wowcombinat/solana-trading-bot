import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';

const LiveTransactionsWrapper = styled.div`
  margin-top: 20px;
`;

const TransactionList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const TransactionItem = styled.li`
  padding: 10px;
  border-bottom: 1px solid ${props => props.theme.borderColor};
`;

const LiveTransactions = ({ wallets }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const socket = io(window.location.origin);

    socket.on('connect', () => {
      console.log('WebSocket connection established');
      wallets.forEach(wallet => {
        socket.emit('subscribe', { walletAddress: wallet.public_key });
      });
    });

    socket.on('transaction', (data) => {
      setTransactions(prevTransactions => [data.data, ...prevTransactions].slice(0, 10));
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [wallets]);

  return (
    <LiveTransactionsWrapper>
      <h2>Live Transactions</h2>
      <TransactionList>
        {transactions.map((tx, index) => (
          <TransactionItem key={index}>
            <p>Signature: {tx.signature}</p>
            <p>Logs: {tx.logs.join(', ')}</p>
          </TransactionItem>
        ))}
      </TransactionList>
    </LiveTransactionsWrapper>
  );
};

export default LiveTransactions;
