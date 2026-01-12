module.exports = {
  name: '005_create_answers_table',
  
  up: async (pool) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS answers (
        id SERIAL PRIMARY KEY,
        attempt_id INT NOT NULL,
        question_id INT NOT NULL,
        selected_option_ids JSONB NOT NULL,
        is_correct BOOLEAN DEFAULT false,
        points_earned INT DEFAULT 0,
        answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        CONSTRAINT unique_attempt_question UNIQUE (attempt_id, question_id)
      );
      CREATE INDEX IF NOT EXISTS idx_attempt_id ON answers(attempt_id);
      CREATE INDEX IF NOT EXISTS idx_question_id ON answers(question_id);
    `;
    await pool.execute(sql);
  }
};
