require('dotenv').config();
const { pool } = require('./config/database');

async function testAttemptCreation() {
  try {
    console.log('🧪 Testing Attempt Creation in NEON Database...\n');
    
    // 1. Check connection
    console.log('1️⃣ Checking database connection...');
    const client = await pool.connect();
    console.log('✅ Connected to database\n');
    client.release();

    // 2. Create a test attempt
    console.log('2️⃣ Creating a test attempt...');
    const now = new Date();
    const expiration = new Date(now.getTime() + 30 * 60000); // 30 minutes

    const [result] = await pool.execute(
      `INSERT INTO quiz_attempts 
      (quiz_id, user_id, start_time, expiration_time, status, total_points)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [1, 999, now, expiration, 'in_progress', 100]
    );

    const attemptId = result[0].id;
    console.log(`✅ Attempt created with ID: ${attemptId}\n`);

    // 3. Verify it was saved
    console.log('3️⃣ Verifying attempt was saved...');
    const [verify] = await pool.execute(
      'SELECT * FROM quiz_attempts WHERE id = $1',
      [attemptId]
    );

    if (verify.length > 0) {
      console.log('✅ Attempt found in database!');
      console.log('\n📊 Attempt Details:');
      console.log(JSON.stringify(verify[0], null, 2));
      console.log('\n✅ Data is being stored in NEON database correctly!');
    } else {
      console.log('❌ Attempt not found in database!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testAttemptCreation();
