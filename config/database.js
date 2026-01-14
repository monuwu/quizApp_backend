const { Pool } = require('pg');
require('dotenv').config();

// Use Neon DB connection string from .env
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Wrapper to make it compatible with MySQL2 syntax
const poolWrapper = {
  async execute(query, params = []) {
    const result = await pool.query(query, params);
    return [result.rows, result.fields];
  },
  async getConnection() {
    const client = await pool.connect();
    return {
      async execute(query, params = []) {
        const result = await client.query(query, params);
        return [result.rows, result.fields];
      },
      release: () => client.release(),
      async beginTransaction() {
        await client.query('BEGIN');
      },
      async commit() {
        await client.query('COMMIT');
      },
      async rollback() {
        await client.query('ROLLBACK');
      }
    };
  }
};

// Test connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { pool: poolWrapper, testConnection };
