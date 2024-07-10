import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const CopyTradingWrapper = styled.div`
  margin: 20px 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 300px;
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

const CopyTrading = ({ wallets }) => {
  const [masterWallet, setMasterWallet] = useState('');
  const [followers, setFollowers] = useState([]);

  const handleCopyTrade = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/copy-trade', { masterWallet, followers });
      alert('Copy trade executed successfully');
    } catch (error) {
      console.error('Error executing copy trade:', error);
      alert('Failed to execute copy trade: ' + error.response?.data?.error || error.message);
    }
  };

  return (
    <CopyTradingWrapper>
      <h3>Copy Trading</h3>
      <Form onSubmit={handleCopyTrade}>
        <Select value={masterWallet} onChange={(e) => setMasterWallet(e.target.value)} required>
          <option value="">Select Master Wallet</option>
          {wallets.filter(w => w.is_master).map(wallet => (
            <option key={wallet.public_key} value={wallet.public_key}>
              {wallet.account_name}
            </option>
          ))}
        </Select>
        <div>
          {wallets.filter(w => !w.is_master).map(wallet => (
            <label key={wallet.public_key}>
              <input
                type="checkbox"
                checked={followers.includes(wallet.public_key)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFollowers([...followers, wallet.public_key]);
                  } else {
                    setFollowers(followers.filter(f => f !== wallet.public_key));
                  }
                }}
              />
              {wallet.account_name}
            </label>
          ))}
        </div>
        <Button type="submit">Execute Copy Trade</Button>
      </Form>
    </CopyTradingWrapper>
  );
};

export default CopyTrading;
