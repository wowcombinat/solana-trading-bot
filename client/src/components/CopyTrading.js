import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CopyTrading = () => {
    const [wallets, setWallets] = useState([]);
    const [masterWallet, setMasterWallet] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const response = await axios.get('/api/wallets');
                setWallets(response.data);
            } catch (error) {
                console.error('Error fetching wallets', error);
            }
        };

        fetchWallets();
    }, []);

    const handleCopyTrade = async () => {
        try {
            const response = await axios.post('/api/copytrade', { masterWallet });
            setMessage('Copy trading setup successfully!');
        } catch (error) {
            setMessage('Error setting up copy trading');
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Copy Trading</h2>
            <select onChange={(e) => setMasterWallet(e.target.value)}>
                <option value="">Select Master Wallet</option>
                {wallets.map(wallet => (
                    <option key={wallet.public_key} value={wallet.public_key}>
                        {wallet.name}
                    </option>
                ))}
            </select>
            <button onClick={handleCopyTrade}>Setup Copy Trading</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default CopyTrading;

