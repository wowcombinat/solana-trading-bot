import React from 'react';
import styled from 'styled-components';

const AssetDisplayWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h2`
  color: ${props => props.theme.primary};
`;

const AssetList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const AssetItem = styled.li`
  background-color: ${props => props.theme.cardBackground};
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

function AssetDisplay({ wallets, assets }) {
  return (
    <AssetDisplayWrapper>
      <Title>Wallet Assets</Title>
      <AssetList>
        {wallets.map((wallet) => (
          <AssetItem key={wallet.public_key}>
            <span>{wallet.account_name}</span>
            {assets[wallet.public_key] ? (
              assets[wallet.public_key].error ? (
                <span>Error: {assets[wallet.public_key].error}</span>
              ) : (
                <span>{assets[wallet.public_key].solBalance || 0} SOL</span>
              )
            ) : (
              <span>Loading...</span>
            )}
          </AssetItem>
        ))}
      </AssetList>
    </AssetDisplayWrapper>
  );
}

export default AssetDisplay;
