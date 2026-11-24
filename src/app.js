// src/app.js
// TEMPORARY minimal server. Person 2's version will replace this file.
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' }, message: 'OK' });
});

app.use('/api/services', require('./modules/services/services.routes'));

// TEMP error handler: Person 2 owns the real one
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, data: null, message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('API on http://localhost:' + PORT));
