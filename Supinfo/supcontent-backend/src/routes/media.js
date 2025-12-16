const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbService');

// Search
router.get('/search', async (req, res) => {
    const { query, page } = req.query;
    if (!query) return res.status(400).json({ message: 'Query is required' });

    try {
        const data = await tmdbService.searchMulti(query, page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data from TMDB' });
    }
});

// Get Details
router.get('/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    if (!['movie', 'tv'].includes(type)) {
        return res.status(400).json({ message: 'Invalid media type' });
    }

    try {
        const data = await tmdbService.getDetails(type, id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching details' });
    }
});

// Get Trending
router.get('/trending', async (req, res) => {
    try {
        const data = await tmdbService.getTrending();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trending' });
    }
});

// Discover
router.get('/discover/:type', async (req, res) => {
    const { type } = req.params;
    if (!['movie', 'tv'].includes(type)) {
        return res.status(400).json({ message: 'Invalid media type' });
    }

    try {
        const data = await tmdbService.discover(type, req.query);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error discovering media' });
    }
});

module.exports = router;
