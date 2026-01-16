require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  console.log('🔍 Testing Neon Database Connection\n');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const result = await pool.query('SELECT NOW()');
    console.log('\n✅ Successfully connected to Neon database!');
    console.log('Current time from DB:', result.rows[0].now);
    
    // Test inserting attempt
    console.log('\n📝 Creating test attempt...');
    const now = new Date();
    const expiration = new Date(now.getTime() + 30 * 60000);
    
    const insertResult = await pool.query(
      `INSERT INTO quiz_attempts 
       (quiz_id, user_id, start_time, expiration_time, status, total_points)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [1, 999, now, expiration, 'in_progress', 100]
    );
    
    console.log('✅ Attempt inserted successfully!');
    console.log('Attempt details:', JSON.stringify(insertResult.rows[0], null, 2));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
