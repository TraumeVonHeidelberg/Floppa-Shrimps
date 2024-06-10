const express = require('express');
const router = express.Router();
const Table = require('../models/table');

// Endpoint do pobierania maksymalnej liczby miejsc
router.get('/tables/max-seats', async (req, res) => {
    try {
        const maxSeats = await Table.max('seats');
        res.json({ maxSeats });
    } catch (error) {
        console.error('Error fetching max seats:', error);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

module.exports = router;
