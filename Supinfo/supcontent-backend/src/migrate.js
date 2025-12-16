const { query, pool } = require('./config/database');

async function migrate() {
    console.log('Starting migration...');
    try {
        console.log('Adding is_highlighted column to reviews...');
        await query('ALTER TABLE reviews ADD COLUMN is_highlighted BOOLEAN DEFAULT FALSE');
        console.log('Success!');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists.');
        } else {
            console.error('Migration failed:', error.message);
        }
    } finally {
        pool.end();
        process.exit(0);
    }
}

migrate();
