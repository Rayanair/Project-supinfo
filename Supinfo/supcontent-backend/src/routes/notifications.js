const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { query } = require('../config/database');

// Get Notifications
router.get('/', authenticate, async (req, res) => {
    try {
        const notifications = await query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [req.user.id]
        );
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark Read
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        await query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark All Read
router.put('/read-all', authenticate, async (req, res) => {
    try {
        await query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
            [req.user.id]
        );
        res.json({ message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
