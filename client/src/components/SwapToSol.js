import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SwapToSol = () => {
    const [wallets, setWallets] = useState([]);
    const [selectedWallet, setSelectedWallet] = useState('');
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

    const handleSwapToSol = async () => {
        try {
            const response = await axios.post('/api/swapalltosol', { walletPublicKey: selectedWallet });
            setMessage('All assets swapped to SOL successfully!');
        } catch (error) {
            setMessage('Error swapping all assets to SOL');
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Swap All Assets to SOL</h2>
            <select onChange={(e) => setSelectedWallet(e.target.value)}>
                <option value="">Select Wallet</option>
                {wallets.map(wallet => (
                    <option key={wallet.public_key} value={wallet.public_key}>
                        {wallet.name}
                    </option>
                ))}
            </select>
            <button onClick={handleSwapToSol}>Swap All to SOL</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default SwapToSol;
