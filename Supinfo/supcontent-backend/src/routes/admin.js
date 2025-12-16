const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const { query } = require('../config/database');

// Middleware: all routes require admin
router.use(authenticate, isAdmin);

// Get Statistics
router.get('/stats', async (req, res) => {
    try {
        const usersCount = (await query('SELECT COUNT(*) as c FROM users'))[0].c;
        const reviewsCount = (await query('SELECT COUNT(*) as c FROM reviews'))[0].c;
        const reportsCount = (await query('SELECT COUNT(*) as c FROM reports WHERE status = "pending"'))[0].c;

        res.json({ usersCount, reviewsCount, reportsCount });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Users
router.get('/users', async (req, res) => {
    try {
        const users = await query('SELECT id, username, email, created_at, role FROM users ORDER BY created_at DESC LIMIT 100');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Reviews
router.get('/reviews', async (req, res) => {
    try {
        const reviews = await query(`
            SELECT r.*, u.username as author_name, 
                   COALESCE(m.data->>'$.title', m.data->>'$.name', 'Média inconnu') as media_title 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            LEFT JOIN media_cache m ON r.tmdb_id = m.tmdb_id AND r.media_type = m.type
            ORDER BY r.created_at DESC 
            LIMIT 100
        `);
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Reports
router.get('/reports', async (req, res) => {
    try {
        const reports = await query(
            `SELECT r.*, u.username as reporter_name 
             FROM reports r 
             JOIN users u ON r.reporter_id = u.id 
             ORDER BY r.created_at DESC`
        );
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Resolve Report
router.put('/reports/:id', async (req, res) => {
    const { status } = req.body;
    try {
        await query('UPDATE reports SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Report updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Ban User
router.put('/users/:id/ban', async (req, res) => {
    // In real world, maybe an is_banned flag or delete
    // Here we'll just delete for simplicity or assume active flag
    // Let's add is_banned to schema or just use delete
    try {
        await query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User banned/deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Highlight Review (Coup de cœur)
router.put('/reviews/:id/highlight', async (req, res) => {
    try {
        // Toggle status: first get current
        const reviews = await query('SELECT is_highlighted FROM reviews WHERE id = ?', [req.params.id]);
        if (reviews.length === 0) return res.status(404).json({ message: 'Review not found' });

        const newValue = !reviews[0].is_highlighted;
        await query('UPDATE reviews SET is_highlighted = ? WHERE id = ?', [newValue, req.params.id]);

        res.json({ message: 'Highlight updated', is_highlighted: newValue });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
