const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/contact', (req, res) => {
    const { name, message } = req.body;
    console.log(`Received message from ${name}: ${message}`);
    res.json({ status: 'success', message: 'Message received successfully!' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});