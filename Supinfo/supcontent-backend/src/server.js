const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust in production
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_user', (userId) => {
        socket.join(`user_${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Make io available in routes
app.set('io', io);

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to SUPCONTENT API' });
});

// Auth Routes (Placeholder)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/media', require('./routes/media'));
app.use('/api/lists', require('./routes/lists'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/social', require('./routes/social'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/search', require('./routes/search'));
app.use('/api/chat', require('./routes/chat')); // [New Route]

const { pool } = require('./config/database');

const notificationService = require('./services/notificationService');
notificationService.init(io);

const PORT = process.env.PORT || 5000;

// Auto-migration for Messages table
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT NOT NULL,
                content TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_sender_receiver (sender_id, receiver_id),
                INDEX idx_receiver_sender (receiver_id, sender_id)
            );
        `);
        console.log('Messages table verified/created');
    } catch (err) {
        console.error('DB Migration error:', err);
    }
};

initDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
