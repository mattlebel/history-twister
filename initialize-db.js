const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./history-twister.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the history-twister database.');
});

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS twisted_history (guid TEXT PRIMARY KEY, content TEXT NOT NULL)', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Table created or already exists.');
  });
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Closed the database connection.');
});
