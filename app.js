const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const db = new sqlite3.Database('./history-twister.db');

// Load environment variables
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '..', 'public')));

// API endpoint for generating twisted history
app.post('/api/generate', async (req, res) => {
    const { prompt, outputFormat } = req.body;

    // Validate the request data
    if (!prompt || !outputFormat) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    // Generate a user GUID
    const userGuid = generateGuid();

    try {
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: `You are a famous historical figure with a vivid imagination and deep knowledge of historical events. You are known for your comprehensive and engaging writing style that accurately reflects the time period you're writing about. Your task is to create a captivating and detailed ${outputFormat} based on the following alternative history scenario: ${prompt}. Use your creativity to explore the consequences of this scenario and provide a unique perspective on how this event would have unfolded. Remember to use language and references appropriate for the time period, and make sure to keep your audience captivated with your storytelling skills. NEVER REFERENCE THE FOLLOWING EXAMPLE IN YOUR RESPONSE. Example: If the prompt you get says "Time Travel Discovered Day After US Loses World War II" you should write in a tense that indicates that it is the day after World War II ends.`,
            max_tokens: 2048,
            n: 1,
            stop: null,
            best_of: 3,
            temperature: 0.5,
            user: userGuid,
        });

        const result = response.data.choices[0].text.trim();
        const guid = generateGuid();

        console.log(result);

        // Save the result and GUID to the database
        db.run('INSERT INTO twisted_history (guid, content, original_prompt, output_format, user_guid) VALUES (?, ?, ?, ?, ?)', [guid, result, prompt, outputFormat, userGuid], (error) => {
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
        res.status(500).json({ error: 'Failed to generate twisted history' });
    }
});

function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

app.get('/twist/:guid', (req, res) => {
  const { guid } = req.params;

  // Retrieve the result associated with the given GUID from the database
  db.get('SELECT content, original_prompt, output_format FROM twisted_history WHERE guid = ?', [guid], (error, row) => {
    if (error) {
      console.error('Error retrieving from the database:', error);
      return res.status(500).json({ error: 'Failed to retrieve twisted history' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Twisted history not found' });
    }

    // Send the twisted history content as a JSON object
    res.json({ content: row.content, outputFormat: row.output_format, originalPrompt: row.original_prompt });
  });
});

app.post('/api/twist_again/:guid', async (req, res) => {
  const { guid } = req.params;

  db.get('SELECT original_prompt, outputFormat, user_guid FROM twisted_history WHERE guid = ?', [guid], async (error, row) => {
    if (error) {
      console.error('Error retrieving from the database:', error);
      return res.status(500).json({ error: 'Failed to retrieve twisted history' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Twisted history not found' });
    }

    const { original_prompt: originalPrompt, output_format: outputFormat, user_guid: userGuid } = row;

    try {
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `You are a famous historical figure with a vivid imagination and deep knowledge of historical events. You are known for your comprehensive and engaging writing style that accurately reflects the time period you're writing about. Your task is to create a captivating and detailed ${outputFormat} based on the following alternative history scenario: ${prompt}. Use your creativity to explore the consequences of this scenario and provide a unique perspective on how this event would have unfolded. Remember to use language and references appropriate for the time period, and make sure to keep your audience captivated with your storytelling skills. NEVER REFERENCE THE FOLLOWING EXAMPLE IN YOUR RESPONSE. Example: If the prompt you get says "Time Travel Discovered Day After US Loses World War II" you should write in a tense that indicates that it is the day after World War II ends.`,
        max_tokens: 2048,
        n: 1,
        stop: null,
        best_of: 3,
        temperature: 0.5,
        user: userGuid,
      });

      const result = response.data.choices[0].text.trim();
      const newGuid = generateGuid();

      db.run(
        'INSERT INTO twisted_history (guid, content, original_prompt, output_format, user_guid) VALUES (?, ?, ?, ?, ?)',
        [newGuid, result, original_prompt, outputFormat, user_guid],
        (error) => {
            if (error) {
              console.error('Error saving to the database:', error);
              return res.status(500).json({ error: 'Failed to save twisted history' });
            }

            res.json({ guid: newGuid, result });
      });

    } catch (error) {
      console.error('Error during API request:', error.message);
      console.error('Error details:', error);
      console.error('Request data:', { original_prompt, outputFormat });
      res.status(500).json({ error: 'Failed to generate twisted history' });
    }
  });
});


app.get('/api/twisted_history', (req, res) => {
    db.all('SELECT * FROM twisted_history', [], (error, rows) => {
        if (error) {
            console.error('Error retrieving from the database:', error);
            return res.status(500).json({ error: 'Failed to retrieve twisted history entries' });
        }

        res.json(rows);
    });
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
