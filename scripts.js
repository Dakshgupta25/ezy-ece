
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path'); // For serving static files
const app = express();
const port = 3000;

// Replace with your actual API key and external user ID
const apiKey = 'crEP858zxozHMkn9AL4TCoWwDEI1HaRd'; // <-- Replace with your API key
const externalUserId = 'tech_army'; // <-- Replace with your external user ID

// Middleware
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Function to create a chat session
const createChatSession = async () => {
  try {
    const response = await axios.post(
      'https://api.on-demand.io/chat/v1/sessions',
      {
        pluginIds: [],
        externalUserId: externalUserId
      },
      {
        headers: {
          apikey: apiKey
        }
      }
    );
    return response.data.data.id; // Extract and return session ID
  } catch (error) {
    console.error('Error creating chat session:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Function to submit a query
const submitQuery = async (sessionId, query) => {
  try {
    const response = await axios.post(
      `https://api.on-demand.io/chat/v1/sessions/${sessionId}/query`,
      {
        endpointId: 'predefined-openai-gpt4o',
        query: query,
        pluginIds: ['plugin-1713962163', 'plugin-1726232075'],
        responseMode: 'sync'
      },
      {
        headers: {
          apikey: apiKey
        }
      }
    );
    return response.data.data.answer; // Return only the answer field
  } catch (error) {
    console.error('Error submitting query:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// API endpoint to create session
app.post('/create-session', async (req, res) => {
  try {
    const sessionId = await createChatSession();
    res.json({ id: sessionId });
  } catch (error) {
    res.status(500).json({ error: 'Error creating chat session', details: error.message });
  }
});

// API endpoint to submit a query
app.post('/submit-query', async (req, res) => {
  const { sessionId, query } = req.body;
  try {
    const answer = await submitQuery(sessionId, query); // Get only the answer
    res.send(answer); // Send the answer directly as plain text
  } catch (error) {
    res.status(500).json({ error: 'Error submitting query', details: error.message });
  }
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve index.html
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
