const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./history-twister.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the history-twister database.');
});

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS twisted_history (guid TEXT PRIMARY KEY, content TEXT NOT NULL, original_prompt TEXT)', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Table created or already exists.');
  });
});

// Add the new column if it doesn't exist
db.run('ALTER TABLE twisted_history ADD COLUMN IF NOT EXISTS original_prompt TEXT', (error) => {
  if (error) {
    console.error('Error updating the database schema:', error);
  } else {
    console.log('Database schema updated.');
  }
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Closed the database connection.');
});
