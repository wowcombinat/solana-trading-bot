const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = new Pool();

const isValidPrivateKey = (key) => {
    return typeof key === 'string' && key.length === 64;
};

// Импорт кошелька
router.post('/import', async (req, res) => {
    const { privateKey } = req.body;
    if (!isValidPrivateKey(privateKey)) {
        return res.status(400).send('Invalid private key');
    }

    try {
        const result = await pool.query(
            'INSERT INTO wallets (private_key) VALUES ($1) RETURNING *',
            [privateKey]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error importing wallet');
    }
});

// Обновление данных кошелька
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name, isActive } = req.body;
    try {
        const result = await pool.query(
            'UPDATE wallets SET name = $1, is_active = $2 WHERE id = $3 RETURNING *',
            [name, isActive, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating wallet');
    }
});

// Копитрейдинг
router.post('/copytrade', async (req, res) => {
    const { masterWallet } = req.body;
    try {
        const result = await pool.query(
            'UPDATE wallets SET master_wallet = $1 WHERE is_master = false RETURNING *',
            [masterWallet]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error setting up copy trading');
    }
});

// Обмен всех активов на SOL
router.post('/swapalltosol', async (req, res) => {
    const { walletPublicKey } = req.body;
    try {
        // Пример запроса на своп всех активов на SOL
        const result = await pool.query(
            'UPDATE assets SET token = $1 WHERE wallet_public_key = $2 RETURNING *',
            ['SOL', walletPublicKey]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error swapping all assets to SOL');
    }
});

module.exports = router;
