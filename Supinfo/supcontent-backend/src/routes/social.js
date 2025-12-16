const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { query } = require('../config/database');

// Follow User
router.post('/follow/:id', authenticate, async (req, res) => {
    const targetId = req.params.id;
    if (req.user.id == targetId) return res.status(400).json({ message: 'Cannot follow yourself' });

    try {
        await query(
            'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
            [req.user.id, targetId]
        );
        res.json({ message: 'Followed' });
    } catch (error) {
        res.status(400).json({ message: 'Already following or error' });
    }
});

// Unfollow User
router.delete('/follow/:id', authenticate, async (req, res) => {
    try {
        await query(
            'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
            [req.user.id, req.params.id]
        );
        res.json({ message: 'Unfollowed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Feed
router.get('/feed', authenticate, async (req, res) => {
    // Aggregates reviews and list additions from following
    try {
        const feed = await query(
            `SELECT 'review' as type, r.id, r.user_id, u.username, u.avatar_url, r.created_at, r.content as payload, r.tmdb_id, r.media_type, r.rating,
             (SELECT COUNT(*) FROM review_likes WHERE review_id = r.id) as likes_count,
             (SELECT COUNT(*) FROM comments WHERE review_id = r.id) as comments_count,
             EXISTS(SELECT 1 FROM review_likes WHERE review_id = r.id AND user_id = ?) as is_liked
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             JOIN follows f ON f.following_id = r.user_id
             WHERE f.follower_id = ?
             
             UNION
             
             SELECT 'list_item' as type, li.id, l.user_id, u.username, u.avatar_url, li.added_at as created_at, 
             CONCAT(l.name, ':', li.status) as payload, li.tmdb_id, li.media_type, NULL as rating,
             0 as likes_count, 0 as comments_count, 0 as is_liked
             FROM list_items li
             JOIN lists l ON li.list_id = l.id
             JOIN users u ON l.user_id = u.id
             JOIN follows f ON f.following_id = l.user_id
             WHERE f.follower_id = ? AND l.is_public = TRUE
             
             ORDER BY created_at DESC
             LIMIT 50`,
            [req.user.id, req.user.id, req.user.id]
        );

        // Enrich with media data (simplified, normally use JOIN with cache or separate fetch)
        // For optimization, client can fetch media details if missing

        res.json(feed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
