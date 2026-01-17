module.exports = {
  name: '004_create_quiz_attempts_table',
  
  up: async (pool) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id SERIAL PRIMARY KEY,
        quiz_id INT NOT NULL,
        user_id INT,
        start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP NULL,
        expiration_time TIMESTAMP NOT NULL,
        status VARCHAR(20) CHECK (status IN ('in_progress', 'completed', 'expired', 'abandoned')) DEFAULT 'in_progress',
        score INT DEFAULT 0,
        total_points INT DEFAULT 0,
        percentage DECIMAL(5,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_quiz_id ON quiz_attempts(quiz_id);
      CREATE INDEX IF NOT EXISTS idx_user_id ON quiz_attempts(user_id);
      CREATE INDEX IF NOT EXISTS idx_status ON quiz_attempts(status);
      CREATE INDEX IF NOT EXISTS idx_expiration ON quiz_attempts(expiration_time);
    `;
    await pool.execute(sql);
  }
};
