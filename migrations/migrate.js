const { pool } = require('../config/database');
require('dotenv').config();

const migrations = [
  require('./001_create_quizzes_table'),
  require('./002_create_questions_table'),
  require('./003_create_options_table'),
  require('./004_create_quiz_attempts_table'),
  require('./005_create_answers_table')
];

const runMigrations = async () => {
  try {
    console.log('🚀 Starting migrations...\n');
    
    for (const migration of migrations) {
      console.log(`Running: ${migration.name}`);
      await migration.up(pool);
      console.log(`✅ Completed: ${migration.name}\n`);
    }
    
    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

runMigrations();
