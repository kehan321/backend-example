const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Basic endpoint
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

// A POST endpoint for testing
app.post('/data', (req, res) => {
    const { name } = req.body;
    res.send(`Hello, ${name}!`);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
