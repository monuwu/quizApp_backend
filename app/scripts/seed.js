const { pool } = require('../../config/database');

/**
 * Seed script to populate database with sample quiz data
 */
async function seedDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log('Starting database seeding...');


    // Insert default levels
    await connection.execute(`
      INSERT INTO "Level" (name, description, min_score) VALUES
      ('Beginner', 'Entry level', 0),
      ('Intermediate', 'Intermediate level', 50),
      ('Advanced', 'Advanced level', 80)
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✅ Levels inserted');

    // Insert sample quizzes
    const [quizResult] = await connection.execute(`
      INSERT INTO quizzes (title, description, level, duration_minutes, passing_score) VALUES
      ('JavaScript Basics', 'Test your knowledge of JavaScript fundamentals', 'beginner', 30, 70),
      ('Node.js Advanced', 'Advanced Node.js concepts and patterns', 'advanced', 45, 75),
      ('Express.js Intermediate', 'Express.js routing and middleware', 'intermediate', 40, 70)
    `);
    console.log('✅ Quizzes inserted');

    // Insert questions for Quiz 1 (JavaScript Basics)
    await connection.execute(`
      INSERT INTO questions (quiz_id, question_text, question_type, points, order_number) VALUES
      (1, 'What is the correct syntax to print a message in the console?', 'single', 1, 1),
      (1, 'Which of the following are JavaScript data types? (Select all that apply)', 'multiple', 2, 2),
      (1, 'What keyword is used to declare a constant variable?', 'single', 1, 3),
      (1, 'What will be the output of: typeof null?', 'single', 1, 4),
      (1, 'Which array method removes the last element from an array?', 'single', 1, 5)
    `);

    console.log('✅ Questions inserted');

    // Insert options for Question 1
    await connection.execute(`
      INSERT INTO options (question_id, option_text, is_correct, order_number) VALUES
      (1, 'console.log("Hello World")', true, 1),
      (1, 'print("Hello World")', false, 2),
      (1, 'echo("Hello World")', false, 3),
      (1, 'System.out.println("Hello World")', false, 4)
    `);

    // Insert options for Question 2 (multiple correct)
    await connection.execute(`
      INSERT INTO options (question_id, option_text, is_correct, order_number) VALUES
      (2, 'String', true, 1),
      (2, 'Number', true, 2),
      (2, 'Boolean', true, 3),
      (2, 'Character', false, 4),
      (2, 'Object', true, 5)
    `);

    // Insert options for Question 3
    await connection.execute(`
      INSERT INTO options (question_id, option_text, is_correct, order_number) VALUES
      (3, 'const', true, 1),
      (3, 'let', false, 2),
      (3, 'var', false, 3),
      (3, 'constant', false, 4)
    `);

    // Insert options for Question 4
    await connection.execute(`
      INSERT INTO options (question_id, option_text, is_correct, order_number) VALUES
      (4, 'object', true, 1),
      (4, 'null', false, 2),
      (4, 'undefined', false, 3),
      (4, 'number', false, 4)
    `);

    // Insert options for Question 5
    await connection.execute(`
      INSERT INTO options (question_id, option_text, is_correct, order_number) VALUES
      (5, 'pop()', true, 1),
      (5, 'push()', false, 2),
      (5, 'shift()', false, 3),
      (5, 'splice()', false, 4)
    `);

    console.log('✅ Options inserted');

    // Insert questions for Quiz 2 (Node.js Advanced)
    await connection.execute(`
      INSERT INTO questions (quiz_id, question_text, question_type, points, order_number) VALUES
      (2, 'What is the event loop in Node.js?', 'single', 2, 1),
      (2, 'Which of the following are core Node.js modules? (Select all)', 'multiple', 3, 2),
      (2, 'What is the purpose of package.json?', 'single', 2, 3)
    `);

    // Options for Node.js questions
    await connection.execute(`
      INSERT INTO options (question_id, option_text, is_correct, order_number) VALUES
      (6, 'A mechanism that handles asynchronous operations', true, 1),
      (6, 'A loop that runs indefinitely', false, 2),
      (6, 'A database connection pool', false, 3),
      (6, 'A debugging tool', false, 4)
    `);

    await connection.execute(`
      INSERT INTO options (question_id, option_text, is_correct, order_number) VALUES
      (7, 'fs', true, 1),
      (7, 'http', true, 2),
      (7, 'path', true, 3),
      (7, 'express', false, 4),
      (7, 'events', true, 5)
    `);

    await connection.execute(`
      INSERT INTO options (question_id, option_text, is_correct, order_number) VALUES
      (8, 'To manage project dependencies and metadata', true, 1),
      (8, 'To store application data', false, 2),
      (8, 'To configure the database', false, 3),
      (8, 'To define API routes', false, 4)
    `);

    console.log('✅ All seed data inserted successfully!');
    console.log('\n📊 Summary:');
    console.log('- 3 Quizzes');
    console.log('- 8 Questions');
    console.log('- 25+ Options');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

// Run seeding
seedDatabase()
  .then(() => {
    console.log('\n✅ Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  });
