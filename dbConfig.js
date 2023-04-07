// dbConfig.js

const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

class SQLiteWrapper {
  constructor(database) {
    this.database = database;
  }

  query(queryString, params, callback) {
    if (params && callback) {
      this.database.all(queryString, params, callback);
    } else if (callback) {
      this.database.all(queryString, callback);
    } else {
      return new Promise((resolve, reject) => {
        this.database.all(queryString, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }
  }
}

let db;

if (process.env.NODE_ENV === 'production') {
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  const sqliteDb = new sqlite3.Database('history-twister.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the local SQLite database.');
  });
  db = new SQLiteWrapper(sqliteDb);
}

module.exports = db;
