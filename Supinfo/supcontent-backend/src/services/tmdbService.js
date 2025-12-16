const axios = require('axios');
const NodeCache = require('node-cache');
const db = require('../config/database');

const tmdbCache = new NodeCache({ stdTTL: 3600 }); // 1 hour memory cache
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

const tmdbClient = axios.create({
    baseURL: TMDB_BASE_URL,
    params: {
        api_key: API_KEY,
        language: 'fr-FR'
    }
});

// Helper to get from DB cache or fetch from TMDB
async function getOrFetch(key, fetchFn, type, id) {
    // 1. Try memory cache
    const memoriaCached = tmdbCache.get(key);
    if (memoriaCached) return memoriaCached;

    // 2. Try DB cache (for details only)
    if (id && type) {
        try {
            const dbCached = await db.query(
                'SELECT data FROM media_cache WHERE tmdb_id = ? AND type = ? AND last_updated > DATE_SUB(NOW(), INTERVAL 24 HOUR)',
                [id, type]
            );
            if (dbCached.length > 0) {
                const data = dbCached[0].data; // Assuming mysql driver parses JSON automatically, if not JSON.parse
                tmdbCache.set(key, data);
                return data;
            }
        } catch (err) {
            console.error('DB Cache error:', err);
        }
    }

    // 3. Fetch from TMDB
    try {
        const data = await fetchFn();

        // Save to memory cache
        tmdbCache.set(key, data);

        // Save to DB cache if it's a detail view
        if (id && type) {
            await db.query(
                'INSERT INTO media_cache (tmdb_id, type, data, last_updated) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE data = ?, last_updated = NOW()',
                [id, type, JSON.stringify(data), JSON.stringify(data)]
            );
        }

        return data;
    } catch (error) {
        console.error('TMDB API Error:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = {
    searchMulti: async (query, filters = {}) => {
        const page = filters.page || 1;
        const key = `search_${query}_${JSON.stringify(filters)}`;

        return getOrFetch(key, async () => {
            // 1. Author Filter Strategy: If author is present, we prioritize finding works BY that author
            if (filters.author) {
                const person = await module.exports.searchPerson(filters.author);
                if (person) {
                    // Use discover with_people
                    const type = filters.type || 'movie'; // Default to movie if not specified since multi discover isn't a thing
                    const discoverParams = {
                        with_people: person.id,
                        page,
                    };
                    if (filters.year) {
                        if (type === 'movie') discoverParams.primary_release_year = filters.year;
                        if (type === 'tv') discoverParams.first_air_date_year = filters.year;
                    }
                    if (filters.genre) {
                        discoverParams.with_genres = filters.genre;
                    }

                    const res = await tmdbClient.get(`/discover/${type}`, { params: discoverParams });
                    return {
                        ...res.data,
                        results: res.data.results.map(item => ({ ...item, media_type: type }))
                    };
                }
                // If person not found, fall back to normal search maybe?
            }

            // 2. Type/Year Filter Strategy
            if (filters.type === 'movie' || filters.type === 'tv') {
                const params = { query, page };
                if (filters.year) {
                    if (filters.type === 'movie') params.primary_release_year = filters.year;
                    if (filters.type === 'tv') params.first_air_date_year = filters.year;
                }
                const res = await tmdbClient.get(`/search/${filters.type}`, { params });

                let results = res.data.results.map(item => ({ ...item, media_type: filters.type }));

                // 3. Genre Post-Filtering (TMDB search doesn't support with_genres)
                if (filters.genre) {
                    results = results.filter(item => item.genre_ids && item.genre_ids.includes(parseInt(filters.genre)));
                }

                return {
                    ...res.data,
                    results
                };
            }

            // 4. Default Multi Search
            const res = await tmdbClient.get('/search/multi', { params: { query, page } });
            let results = res.data.results;

            // Genre Post-Filtering for Multi Search
            if (filters.genre) {
                results = results.filter(item => item.genre_ids && item.genre_ids.includes(parseInt(filters.genre)));
            }

            return { ...res.data, results };
        });
    },

    getDetails: async (type, id) => {
        const key = `details_${type}_${id}`;
        return getOrFetch(key, async () => {
            const res = await tmdbClient.get(`/${type}/${id}`, {
                params: { append_to_response: 'credits,videos,similar' }
            });
            return res.data;
        }, type, id);
    },

    getTrending: async (timeWindow = 'week') => {
        const key = `trending_${timeWindow}`;
        return getOrFetch(key, async () => {
            const res = await tmdbClient.get(`/trending/all/${timeWindow}`);
            return res.data;
        });
    },

    discover: async (type, filters = {}) => {
        const key = `discover_${type}_${JSON.stringify(filters)}`;
        return getOrFetch(key, async () => {
            const res = await tmdbClient.get(`/discover/${type}`, { params: filters });
            return res.data;
        });
    }
};
