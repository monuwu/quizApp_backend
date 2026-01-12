module.exports = {
  name: '001_create_quizzes_table',
  
  up: async (pool) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
        duration_minutes INT NOT NULL,
        passing_score INT DEFAULT 70,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_level ON quizzes(level);
      CREATE INDEX IF NOT EXISTS idx_active ON quizzes(is_active);
    `;
    await pool.execute(sql);
  }
};
