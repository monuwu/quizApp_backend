const { Pool } = require('pg');
require('dotenv').config();

async function createDatabaseIfNotExists() {
  // Connect to postgres default database first
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Connect to default postgres database
  });

  try {
    // Check if database exists
    const result = await pool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [process.env.DB_NAME]
    );

    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      await pool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`✅ Database '${process.env.DB_NAME}' created successfully`);
    } else {
      console.log(`✅ Database '${process.env.DB_NAME}' already exists`);
    }
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

module.exports = { createDatabaseIfNotExists };
