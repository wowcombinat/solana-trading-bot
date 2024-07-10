import React, { useState } from 'react';
import axios from 'axios';

const ImportPrivateKey = ({ onImport }) => {
  const [privateKey, setPrivateKey] = useState('');
  const [accountName, setAccountName] = useState('');
  const [password, setPassword] = useState('');

  const handleImport = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/import-private-key', { privateKey, accountName, password });
      alert('Wallet imported successfully');
      onImport();
    } catch (error) {
      console.error('Error importing private key:', error);
      alert('Failed to import private key');
    }
  };

  return (
    <form onSubmit={handleImport}>
      <input
        type="text"
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
        placeholder="Enter private key"
        required
      />
      <input
        type="text"
        value={accountName}
        onChange={(e) => setAccountName(e.target.value)}
        placeholder="Enter account name"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        required
      />
      <button type="submit">Import Wallet</button>
    </form>
  );
};

export default ImportPrivateKey;
