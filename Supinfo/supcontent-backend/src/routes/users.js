const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const { query } = require('../config/database');

// Search Users
router.get('/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    try {
        const users = await query(
            'SELECT id, username, avatar_url FROM users WHERE username LIKE ? LIMIT 10',
            [`%${q}%`]
        );
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get User Profile
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const users = await query(
            'SELECT id, username, bio, avatar_url, created_at FROM users WHERE id = ?',
            [req.params.id]
        );

        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];

        // Stats
        user.reviews_count = (await query('SELECT COUNT(*) as c FROM reviews WHERE user_id = ?', [user.id]))[0].c;
        user.followers_count = (await query('SELECT COUNT(*) as c FROM follows WHERE following_id = ?', [user.id]))[0].c;
        user.following_count = (await query('SELECT COUNT(*) as c FROM follows WHERE follower_id = ?', [user.id]))[0].c;

        if (req.user) {
            user.is_following = (await query('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, user.id])).length > 0;
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Profile
router.put('/me', authenticate, async (req, res) => {
    const { username, email, bio, avatar_url, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        // Validation (basic)
        if (username && username.length < 3) return res.status(400).json({ message: 'Username too short' });

        // Update basic info
        if (username || email || bio || avatar_url) {
            const updates = [];
            const params = [];

            if (username) { updates.push('username = ?'); params.push(username); }
            // Email update usually requires verification, skipping for now or assumed verified
            if (bio) { updates.push('bio = ?'); params.push(bio); }
            if (avatar_url) { updates.push('avatar_url = ?'); params.push(avatar_url); }

            if (updates.length > 0) {
                params.push(userId);
                await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
            }
        }

        // Update Password
        if (newPassword) {
            if (!currentPassword) return res.status(400).json({ message: 'Current password required' });

            const users = await query('SELECT password FROM users WHERE id = ?', [userId]);
            const user = users[0];

            if (!user.password) return res.status(400).json({ message: 'Account uses Google Login' });

            const bcrypt = require('bcryptjs');
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return res.status(400).json({ message: 'Invalid current password' });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Username or Email already taken' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Export Data (GDPR)
router.get('/me/export', authenticate, async (req, res) => {
    try {
        const user = (await query('SELECT id, username, email, created_at FROM users WHERE id = ?', [req.user.id]))[0];
        const reviews = await query('SELECT * FROM reviews WHERE user_id = ?', [req.user.id]);
        const lists = await query('SELECT * FROM lists WHERE user_id = ?', [req.user.id]);

        // Fetch list items for each list
        for (let list of lists) {
            list.items = await query('SELECT * FROM list_items WHERE list_id = ?', [list.id]);
        }

        const exportData = {
            profile: user,
            reviews,
            lists,
            export_date: new Date()
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=supcontent_export_${user.username}.json`);
        res.json(exportData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get User Followers
router.get('/:id/followers', async (req, res) => {
    try {
        const followers = await query(
            `SELECT u.id, u.username, u.avatar_url 
             FROM follows f 
             JOIN users u ON f.follower_id = u.id 
             WHERE f.following_id = ?`,
            [req.params.id]
        );
        res.json(followers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get User Following
router.get('/:id/following', async (req, res) => {
    try {
        const following = await query(
            `SELECT u.id, u.username, u.avatar_url 
             FROM follows f 
             JOIN users u ON f.following_id = u.id 
             WHERE f.follower_id = ?`,
            [req.params.id]
        );
        res.json(following);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
