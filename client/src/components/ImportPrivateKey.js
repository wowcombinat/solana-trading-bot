import React, { useState } from 'react';
import axios from 'axios';

const ImportPrivateKey = () => {
    const [privateKey, setPrivateKey] = useState('');
    const [message, setMessage] = useState('');

    const handleImport = async () => {
        try {
            const response = await axios.post('/api/wallets/import', { privateKey });
            setMessage('Wallet imported successfully!');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setMessage('Invalid private key');
            } else {
                setMessage('Error importing wallet');
            }
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Import Private Key</h2>
            <input
                type="text"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter private key"
            />
            <button onClick={handleImport}>Import</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ImportPrivateKey;

