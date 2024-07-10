import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WalletManager = () => {
    const [wallets, setWallets] = useState([]);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [name, setName] = useState('');
    const [isActive, setIsActive] = useState(false);
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

    const handleUpdate = async (id) => {
        try {
            const response = await axios.put(`/api/wallets/update/${id}`, { name, isActive });
            setMessage('Wallet updated successfully!');
        } catch (error) {
            setMessage('Error updating wallet');
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Wallet Manager</h2>
            <ul>
                {wallets.map((wallet) => (
                    <li key={wallet.id} onClick={() => {
                        setSelectedWallet(wallet);
                        setName(wallet.name);
                        setIsActive(wallet.is_active);
                    }}>
                        {wallet.name}
                    </li>
                ))}
            </ul>
            {selectedWallet && (
                <div>
                    <h3>Update Wallet</h3>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter wallet name"
                    />
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <button onClick={() => handleUpdate(selectedWallet.id)}>Update</button>
                    {message && <p>{message}</p>}
                </div>
            )}
        </div>
    );
};

export default WalletManager;
