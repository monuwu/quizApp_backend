require('dotenv').config();
const { pool } = require('./config/database');

async function checkAttempts() {
  try {
    const [attempts] = await pool.execute('SELECT * FROM quiz_attempts ORDER BY id DESC LIMIT 5');
    console.log('Latest 5 attempts:', JSON.stringify(attempts, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAttempts();
