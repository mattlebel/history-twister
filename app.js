const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');

const db = require('./dbConfig');

const isProduction = process.env.NODE_ENV === 'production';

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS twisted_history (
    id ${isProduction ? 'SERIAL' : 'INTEGER'} PRIMARY KEY,
    guid ${isProduction ? 'UUID' : 'TEXT'} UNIQUE NOT NULL,
    content TEXT NOT NULL,
    original_prompt TEXT NOT NULL,
    output_format ${isProduction ? 'VARCHAR(255)' : 'TEXT'} NOT NULL,
    user_guid ${isProduction ? 'UUID' : 'TEXT'} NOT NULL,
    created_at ${isProduction ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
  );
`;


db.query(createTableQuery, (err, res) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Table created or already exists');
  }
});

// Load environment variables
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: 'Too many requests. Please try again later.',
});

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(cookieParser());
app.use('/api/generate', generateLimiter);

// API endpoint for generating twisted history
app.post('/api/generate', async (req, res) => {
  const { prompt, outputFormat } = req.body;

  // Validate the request data
  if (!prompt || !outputFormat) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  // Check for an existing user GUID in the cookies, otherwise generate a new one
  let userGuid = req.cookies.userGuid;
  if (!userGuid) {
    userGuid = generateGuid();
    res.cookie('userGuid', userGuid, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // Set cookie expiration to 30 days
  }

  try {
    // Replace the old API call with the new chat-based API call
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a famous historical figure with a vivid imagination and deep knowledge of historical events. You are known for your comprehensive and engaging writing style that accurately reflects the time period you're writing about. Your task is to create a captivating and detailed alternative history based on the user's prompt. Use your creativity to explore the consequences of this scenario and provide a unique perspective on how this event would have unfolded. Remember to use language and references appropriate for the time period, and make sure to keep your audience captivated with your storytelling skills." },
        { role: "user", content: `Create an ~200 word ${outputFormat} based on the following alternative history scenario: ${prompt}` },
      ],
      temperature: 0.8,
      // Set max token value here
      max_tokens: 300,
    });

    // Access the response
    const result = response.data.choices[0].message.content.trim();
    const guid = generateGuid();

    console.log(result);

    // Save the result and GUID to the database
    db.query('INSERT INTO twisted_history (guid, content, original_prompt, output_format, user_guid) VALUES ($1, $2, $3, $4, $5)', [guid, result, prompt, outputFormat, userGuid], (error) => {
      if (error) {
        console.error('Error saving to the database:', error);
        return res.status(500).json({ error: 'Failed to save twisted history' });
      }

      res.json({ guid, result });
    });

  } catch (error) {
    console.error('Error during API request:', error.message);
    console.error('Error details:', error);
    console.error('Request data:', { prompt, outputFormat });

    if (error.response && error.response.status === 429) {
      res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    } else {
      res.status(500).json({ error: 'Failed to generate Twisted History. API limits reached.' });
    }
  }
});

function generateGuid() {
  return uuidv4(); // Update this line
}

app.get('/twist/:guid', (req, res) => {
  const { guid } = req.params;

  // Retrieve the result associated with the given GUID from the database
  db.query('SELECT content, original_prompt, output_format FROM twisted_history WHERE guid = $1', [guid], (error, result) => {
    if (error) {
      console.error('Error retrieving from the database:', error);
      return res.status(500).json({ error: 'Failed to retrieve twisted history' });
    }

    const rows = result.rows || result; // Add this line

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Twisted history not found' });
    }

    // Extract the row data from the result
    const row = rows[0]; // Update this line

    // Send the twisted history content as a JSON object
    res.json({ content: row.content, outputFormat: row.output_format, originalPrompt: row.original_prompt });
  });
});

// Make sqlite3 table easily accessible locally
if (!isProduction) {
  app.get('/api/twisted_history', (req, res) => {
      db.query('SELECT * FROM twisted_history', [], (error, rows) => {
          if (error) {
              console.error('Error retrieving from the database:', error);
              return res.status(500).json({ error: 'Failed to retrieve twisted history entries' });
          }

          res.json(rows);
      });
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
