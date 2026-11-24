// Builds the app but does NOT start it: server.js does that, and tests import this file.
const express = require('express');
const cors = require('cors');
const { corsOrigin } = require('./config/env');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.disable('x-powered-by');   // don't tell the world which framework we use

//1. Only our frontend may call the API from a browser
app.use(cors({ origin: corsOrigin }));

//2. Read JSON bodies into req.body (refuse anything over 100KB)
app.use(express.json({ limit: '100kb' }));

//3. Routes (the menu): every route lives in src/routes/index.js, under /api
app.use('/api', routes);

//4. No route matched -> 404
app.use(notFound);

//5. Every error ends here (always last)
app.use(errorHandler);

module.exports = app;
