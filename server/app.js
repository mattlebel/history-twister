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

    try {
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: `Imagine a ${outputFormat} about ${prompt}`,
            max_tokens: 200,
            n: 1,
            stop: null,
            temperature: 0.8,
        });

        const result = response.choices[0].text.trim();
        const guid = generateGuid();

        // Save the result and GUID to the database (not implemented here)
        // ...

        res.json({ guid, result });
    } catch (error) {
        console.error('Error during API request:', error.message);
        console.error('Error details:', error);
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
  // Retrieve the result associated with the given GUID from the database (not implemented here)
  // ...

  // Render the Results page with the retrieved content
  res.sendFile(path.join(__dirname, '../public', 'results.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
