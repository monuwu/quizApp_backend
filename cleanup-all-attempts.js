require('dotenv').config();
const { pool } = require('./config/database');

async function cleanupAttempts() {
  try {
    console.log('🗑️  Cleaning up active quiz attempts...\n');

    // Delete all quiz attempts (both active and completed)
    const [result] = await pool.execute('DELETE FROM quiz_attempts');

    console.log('✅ All quiz attempts deleted successfully!');
    console.log(`📊 Deleted records: ${result.affectedRows || 'N/A'}`);
    
    // Verify deletion
    const [remaining] = await pool.execute('SELECT COUNT(*) as count FROM quiz_attempts');
    console.log(`\n📈 Remaining attempts in database: ${remaining[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up attempts:', error);
    process.exit(1);
  }
}

cleanupAttempts();
