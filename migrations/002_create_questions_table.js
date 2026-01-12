module.exports = {
  name: '002_create_questions_table',
  
  up: async (pool) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        quiz_id INT NOT NULL,
        question_text TEXT NOT NULL,
        question_type VARCHAR(20) CHECK (question_type IN ('single', 'multiple')) DEFAULT 'single',
        points INT DEFAULT 1,
        order_number INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_quiz_id ON questions(quiz_id);
    `;
    await pool.execute(sql);
  }
};
