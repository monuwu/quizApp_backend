module.exports = {
  name: '003_create_options_table',
  
  up: async (pool) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS options (
        id SERIAL PRIMARY KEY,
        question_id INT NOT NULL,
        option_text TEXT NOT NULL,
        is_correct BOOLEAN DEFAULT false,
        order_number INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_question_id ON options(question_id);
    `;
    await pool.execute(sql);
  }
};
