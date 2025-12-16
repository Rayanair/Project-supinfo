const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbService');
const { query } = require('../config/database');

router.get('/', async (req, res) => {
    const { q, type, year, genre, author, scope } = req.query;
    const page = parseInt(req.query.page) || 1;

    // Determine limit based on scope
    // 'all' -> limit 5 for overview
    // specific scope -> limit 20 for pagination
    const currentScope = scope || 'all';
    const limit = currentScope === 'all' ? 5 : 20;
    const offset = (page - 1) * limit;

    try {
        const promises = [];
        // Map promises to indices to retrieve them later
        const keys = {};

        // 1. TMDB (Media)
        if (currentScope === 'all' || currentScope === 'media') {
            keys.media = promises.length;
            promises.push(tmdbService.searchMulti(q, { type, year, genre, author, page }));
        }

        // 2. Users
        if (currentScope === 'all' || currentScope === 'users') {
            keys.users = promises.length;
            promises.push(query(`SELECT id, username, avatar_url FROM users WHERE username LIKE ? LIMIT ${limit} OFFSET ${offset}`, [`%${q}%`]));
        }

        // 3. Lists
        if (currentScope === 'all' || currentScope === 'lists') {
            keys.lists = promises.length;
            promises.push(query(`SELECT id, name, description FROM lists WHERE name LIKE ? AND is_public = TRUE LIMIT ${limit} OFFSET ${offset}`, [`%${q}%`]));
        }

        const results = await Promise.allSettled(promises);

        let mediaData = { results: [], total_pages: 1 };
        let users = [];
        let lists = [];

        // Retrieve results based on keys
        if (keys.media !== undefined) {
            const res = results[keys.media];
            if (res.status === 'fulfilled') mediaData = res.value;
            else console.error('TMDB Error:', res.reason);
        }

        if (keys.users !== undefined) {
            const res = results[keys.users];
            if (res.status === 'fulfilled') users = res.value;
            else console.error('Users Error:', res.reason);
        }

        if (keys.lists !== undefined) {
            const res = results[keys.lists];
            if (res.status === 'fulfilled') lists = res.value;
            else console.error('Lists Error:', res.reason);
        }

        res.json({
            media: mediaData.results || [],
            users,
            lists,
            page,
            total_pages: mediaData.total_pages || 1,
            // For SQL based results, naive check if we got full limit
            has_more_users: users.length === limit,
            has_more_lists: lists.length === limit,
            scope: currentScope
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
module.exports = router;
