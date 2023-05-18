const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./history-twister.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the history-twister database.');
});

db.serialize(async () => {
  db.run('CREATE TABLE IF NOT EXISTS twisted_history (guid TEXT PRIMARY KEY, content TEXT NOT NULL)', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Table created or already exists.');
  });

  const addColumnIfNotExists = (columnName, dataType) => {
    return new Promise((resolve, reject) => {
      const query = `PRAGMA table_info(twisted_history)`;
      db.all(query, [], (error, rows) => {
        if (error) {
          console.error(`Error fetching table info for ${columnName}:`, error);
          reject(error);
          return;
        }

        const columnExists = rows.some(row => row.name === columnName);

        if (!columnExists) {
          db.run(`ALTER TABLE twisted_history ADD COLUMN ${columnName} ${dataType}`, (error) => {
            if (error) {
              console.error(`Error adding ${columnName} column:`, error);
              reject(error);
            } else {
              console.log(`Added ${columnName} column.`);
              resolve();
            }
          });
        } else {
          console.log(`${columnName} column already exists.`);
          resolve();
        }
      });
    });
  };

  try {
    await addColumnIfNotExists('original_prompt', 'TEXT');
    await addColumnIfNotExists('output_format', 'TEXT');
    await addColumnIfNotExists('user_guid', 'TEXT');
    await addColumnIfNotExists('image_url', 'TEXT');
  } catch (error) {
    console.error('Error updating the database schema:', error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Closed the database connection.');
    });
  }
});
