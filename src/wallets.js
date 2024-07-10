const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = new Pool();

const isValidPrivateKey = (key) => {
    // Пример проверки длины ключа, необходимо заменить на реальную валидацию
    return typeof key === 'string' && key.length === 64;
};

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

module.exports = router;
