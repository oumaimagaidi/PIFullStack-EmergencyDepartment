const express = require('express');
const router = express.Router();
const { processOCR } = require('../services/ocrService');

router.post('/scan', async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: 'Aucun fichier uploadé' });
        }

        const result = await processOCR(req.files.image);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;