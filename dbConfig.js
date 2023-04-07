// dbConfig.js

const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

let db;

if (process.env.NODE_ENV === 'production') {
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  db = new sqlite3.Database('history-twister.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the local SQLite database.');
  });
}

module.exports = db;
