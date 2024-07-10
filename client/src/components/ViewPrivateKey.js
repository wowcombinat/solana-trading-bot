import React, { useState } from 'react';
import axios from 'axios';

const ViewPrivateKey = ({ publicKey }) => {
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const handleViewPrivateKey = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/view-private-key', { publicKey, password });
      setPrivateKey(response.data.privateKey);
    } catch (error) {
      console.error('Error viewing private key:', error);
      alert('Failed to view private key');
    }
  };

  return (
    <div>
      <form onSubmit={handleViewPrivateKey}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
        />
        <button type="submit">View Private Key</button>
      </form>
      {privateKey && <div>Private Key: {privateKey}</div>}
    </div>
  );
};

export default ViewPrivateKey;
