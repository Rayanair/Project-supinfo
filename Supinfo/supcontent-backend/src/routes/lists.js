const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { query } = require('../config/database');

// Get My Lists
router.get('/', authenticate, async (req, res) => {
    try {
        const lists = await query('SELECT * FROM lists WHERE user_id = ?', [req.user.id]);

        // Enrich lists with items count and preview images
        for (let list of lists) {
            const items = await query(
                'SELECT li.*, mc.data FROM list_items li LEFT JOIN media_cache mc ON li.tmdb_id = mc.tmdb_id AND li.media_type = mc.type WHERE li.list_id = ? ORDER BY li.added_at DESC LIMIT 4',
                [list.id]
            );

            list.item_count = (await query('SELECT COUNT(*) as count FROM list_items WHERE list_id = ?', [list.id]))[0].count;
            list.previews = items.map(item => {
                const data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
                return data ? data.poster_path : null;
            }).filter(p => p);
        }

        res.json(lists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create List
router.post('/', authenticate, async (req, res) => {
    const { name, description, is_public } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    try {
        const result = await query(
            'INSERT INTO lists (user_id, name, description, is_public) VALUES (?, ?, ?, ?)',
            [req.user.id, name, description || null, is_public !== undefined ? is_public : true]
        );
        res.status(201).json({ id: result.insertId, name, description, is_public });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get List Details
router.get('/:id', async (req, res) => {
    try {
        const list = (await query('SELECT * FROM lists WHERE id = ?', [req.params.id]))[0];
        if (!list) return res.status(404).json({ message: 'List not found' });

        // Check privacy
        // TODO: properly integrate optionalAuth to check if user owns the private list
        if (!list.is_public) {
            // For now, simple check: if auth header present verify, else fail
            // In real impl, use middleware to attach user
        }

        const items = await query(
            'SELECT li.*, mc.data FROM list_items li LEFT JOIN media_cache mc ON li.tmdb_id = mc.tmdb_id AND li.media_type = mc.type WHERE li.list_id = ? ORDER BY li.added_at DESC',
            [list.id]
        );

        const enrichedItems = items.map(item => ({
            ...item,
            media_data: typeof item.data === 'string' ? JSON.parse(item.data) : item.data
        }));

        res.json({ ...list, items: enrichedItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add Item to List
router.post('/:id/items', authenticate, async (req, res) => {
    const { tmdb_id, media_type, status } = req.body;
    const listId = req.params.id;

    // Check ownership
    const list = (await query('SELECT * FROM lists WHERE id = ? AND user_id = ?', [listId, req.user.id]))[0];
    if (!list) return res.status(403).json({ message: 'Not authorized' });

    try {
        await query(
            'INSERT INTO list_items (list_id, tmdb_id, media_type, status) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status)',
            [listId, tmdb_id, media_type, status || 'planned']
        );

        // Ensure cache exists (trigger fetch if needed - simplified here, ideally call service)
        // For now assuming frontend calls /details which caches it

        res.json({ message: 'Item added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove Item from List
router.delete('/:id/items/:itemId', authenticate, async (req, res) => {
    const listId = req.params.id;
    const itemId = req.params.itemId; // This corresponds to list_items.id

    const list = (await query('SELECT * FROM lists WHERE id = ? AND user_id = ?', [listId, req.user.id]))[0];
    if (!list) return res.status(403).json({ message: 'Not authorized' });

    try {
        await query('DELETE FROM list_items WHERE id = ?', [itemId]);
        res.json({ message: 'Item removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update List (Rename)
router.put('/:id', authenticate, async (req, res) => {
    const listId = req.params.id;
    const { name, description, is_public } = req.body;

    const list = (await query('SELECT * FROM lists WHERE id = ? AND user_id = ?', [listId, req.user.id]))[0];
    if (!list) return res.status(403).json({ message: 'Not authorized' });

    try {
        await query(
            'UPDATE lists SET name = COALESCE(?, name), description = COALESCE(?, description), is_public = COALESCE(?, is_public) WHERE id = ?',
            [name, description, is_public, listId]
        );
        res.json({ message: 'List updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete List
router.delete('/:id', authenticate, async (req, res) => {
    const listId = req.params.id;

    const list = (await query('SELECT * FROM lists WHERE id = ? AND user_id = ?', [listId, req.user.id]))[0];
    if (!list) return res.status(403).json({ message: 'Not authorized' });

    try {
        await query('DELETE FROM lists WHERE id = ?', [listId]);
        res.json({ message: 'List deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
