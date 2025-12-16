const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { query } = require('../config/database');

// Get Conversations (Last message per user)
router.get('/conversations', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        // Complex query to get distinct users chatted with and the last message
        const sql = `
            SELECT 
                u.id, u.username, u.avatar_url,
                m.content as last_message,
                m.created_at,
                m.sender_id,
                m.is_read
            FROM users u
            JOIN (
                SELECT 
                    CASE 
                        WHEN sender_id = ? THEN receiver_id 
                        ELSE sender_id 
                    END as other_user_id,
                    MAX(created_at) as max_created_at
                FROM messages
                WHERE sender_id = ? OR receiver_id = ?
                GROUP BY other_user_id
            ) latest ON u.id = latest.other_user_id
            JOIN messages m ON (
                (m.sender_id = ? AND m.receiver_id = u.id) OR 
                (m.sender_id = u.id AND m.receiver_id = ?)
            ) AND m.created_at = latest.max_created_at
            ORDER BY m.created_at DESC
        `;

        const conversations = await query(sql, [userId, userId, userId, userId, userId]);
        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Messages with specific user
router.get('/:userId', authenticate, async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const myUserId = req.user.id;

        const messages = await query(
            'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC',
            [myUserId, otherUserId, otherUserId, myUserId]
        );

        // Mark as read
        await query(
            'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
            [otherUserId, myUserId]
        );

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send Message
router.post('/:userId', authenticate, async (req, res) => {
    try {
        const { content } = req.body;
        const receiverId = req.params.userId;
        const senderId = req.user.id;

        if (!content) return res.status(400).json({ message: 'Content required' });

        const result = await query(
            'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
            [senderId, receiverId, content]
        );

        const newMessage = {
            id: result.insertId,
            sender_id: senderId,
            receiver_id: parseInt(receiverId),
            content,
            is_read: false,
            created_at: new Date()
        };

        // Emit Socket Event
        const io = req.app.get('io');
        io.to(`user_${receiverId}`).emit('receive_message', newMessage);

        res.status(201).json(newMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
