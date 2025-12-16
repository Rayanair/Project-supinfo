const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const { query } = require('../config/database');

// Get Reviews for Media
router.get('/media/:type/:id', optionalAuth, async (req, res) => {
    const { type, id } = req.params;

    try {
        const reviews = await query(
            `SELECT r.*, u.username, u.avatar_url, 
            (SELECT COUNT(*) FROM review_likes WHERE review_id = r.id) as likes_count,
            (SELECT COUNT(*) FROM comments WHERE review_id = r.id) as comments_count,
            EXISTS(SELECT 1 FROM review_likes WHERE review_id = r.id AND user_id = ?) as is_liked
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.tmdb_id = ? AND r.media_type = ? 
            ORDER BY r.created_at DESC`,
            [req.user?.id || 0, id, type]
        );

        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Reviews by User
router.get('/user/:id', optionalAuth, async (req, res) => {
    try {
        const reviews = await query(
            `SELECT r.*, u.username, u.avatar_url, 
            (SELECT COUNT(*) FROM review_likes WHERE review_id = r.id) as likes_count,
            (SELECT COUNT(*) FROM comments WHERE review_id = r.id) as comments_count,
            EXISTS(SELECT 1 FROM review_likes WHERE review_id = r.id AND user_id = ?) as is_liked
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.user_id = ? 
            ORDER BY r.created_at DESC`,
            [req.user?.id || 0, req.params.id]
        );
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create Review
router.post('/', authenticate, async (req, res) => {
    const { tmdb_id, media_type, rating, content } = req.body;

    // Validate
    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Invalid rating (1-5)' });
    }

    try {
        await query(
            'INSERT INTO reviews (user_id, tmdb_id, media_type, rating, content) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, tmdb_id, media_type, rating, content]
        );

        // Notify followers (simplified) - in real app use queue/events
        // const followers = await query('SELECT follower_id FROM follows WHERE following_id = ?', [req.user.id]);

        res.status(201).json({ message: 'Review created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Update Review
router.put('/:id', authenticate, async (req, res) => {
    const { rating, content } = req.body;
    const reviewId = req.params.id;

    const review = (await query('SELECT * FROM reviews WHERE id = ? AND user_id = ?', [reviewId, req.user.id]))[0];
    if (!review) return res.status(403).json({ message: 'Not authorized' });

    try {
        await query(
            'UPDATE reviews SET rating = COALESCE(?, rating), content = COALESCE(?, content) WHERE id = ?',
            [rating, content, reviewId]
        );
        res.json({ message: 'Review updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Review
router.delete('/:id', authenticate, async (req, res) => {
    const reviewId = req.params.id;

    const review = (await query('SELECT * FROM reviews WHERE id = ?', [reviewId]))[0];
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    try {
        await query('DELETE FROM reviews WHERE id = ?', [reviewId]);
        res.json({ message: 'Review deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Like Review
router.post('/:id/like', authenticate, async (req, res) => {
    try {
        await query(
            'INSERT INTO review_likes (user_id, review_id) VALUES (?, ?)',
            [req.user.id, req.params.id]
        );
        res.json({ message: 'Liked' });
    } catch (error) {
        // Unique constraint might fail if already liked
        res.status(400).json({ message: 'Already liked or error' });
    }
});

// Unlike Review
router.delete('/:id/like', authenticate, async (req, res) => {
    try {
        await query(
            'DELETE FROM review_likes WHERE user_id = ? AND review_id = ?',
            [req.user.id, req.params.id]
        );
        res.json({ message: 'Unliked' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add Comment
router.post('/:id/comments', authenticate, async (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content required' });

    try {
        await query(
            'INSERT INTO comments (user_id, review_id, content) VALUES (?, ?, ?)',
            [req.user.id, req.params.id, content]
        );
        res.status(201).json({ message: 'Comment added' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Comments
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await query(
            `SELECT c.*, u.username, u.avatar_url 
             FROM comments c 
             JOIN users u ON c.user_id = u.id 
             WHERE c.review_id = ? 
             ORDER BY c.created_at ASC`,
            [req.params.id]
        );
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
