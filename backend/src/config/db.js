const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool to MySQL database
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'football_league_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test helper to verify database connectivity on startup
async function testDbConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL Database (football_league_db) successfully!');
        connection.release();
    } catch (error) {
        console.error('❌ MySQL Connection Failed:', error.message);
        console.error('👉 Please check DB_PASSWORD and DB_USER in backend/.env');
    }
}

testDbConnection();

module.exports = pool;
