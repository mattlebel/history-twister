const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(express.static('public'));

// API endpoint for generating twisted history
app.post('/api/generate', async (req, res) => {
    const { prompt, outputFormat } = req.body;

    // Validate the request data
    if (!prompt || !outputFormat) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
            prompt: `Imagine a ${outputFormat} about ${prompt}`,
            max_tokens: 200,
            n: 1,
            stop: null,
            temperature: 0.8,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const result = response.data.choices[0].text.trim();
        const guid = generateGuid();

        // Save the result and GUID to the database (not implemented here)
        // ...

        res.json({ guid, result });
    } catch (error) {
        console.error(error);
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
