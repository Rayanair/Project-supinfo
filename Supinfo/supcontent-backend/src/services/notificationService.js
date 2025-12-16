const { query } = require('../config/database');

class NotificationService {
    constructor() {
        this.io = null;
    }

    init(io) {
        this.io = io;
    }

    async create(userId, type, message, link = null) {
        try {
            const result = await query(
                'INSERT INTO notifications (user_id, type, message, link) VALUES (?, ?, ?, ?)',
                [userId, type, message, link]
            );

            const notification = {
                id: result.insertId,
                user_id: userId,
                type,
                message,
                link,
                is_read: 0,
                created_at: new Date()
            };

            // Real-time send
            if (this.io) {
                this.io.to(`user_${userId}`).emit('notification', notification);
            }

            return notification;
        } catch (error) {
            console.error('Notification Error:', error);
        }
    }
}

module.exports = new NotificationService();
