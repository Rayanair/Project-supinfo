const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { query } = require('../config/database');

// Create Report
router.post('/', authenticate, async (req, res) => {
    const { target_type, target_id, reason } = req.body;

    if (!['review', 'comment', 'user'].includes(target_type)) {
        return res.status(400).json({ message: 'Invalid target type' });
    }

    try {
        await query(
            'INSERT INTO reports (reporter_id, target_type, target_id, reason) VALUES (?, ?, ?, ?)',
            [req.user.id, target_type, target_id, reason]
        );
        res.json({ message: 'Report submitted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
