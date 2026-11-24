const app = require('./app');
const { port } = require('./config/env');

// Open the door: start listening for requests on the port from .env
app.listen(port, (err) => {
  if (err) {
    // e.g. EADDRINUSE: another program (often another copy of this server) already uses the port
    console.error(`Could not start on port ${port}: ${err.code}`);
    process.exit(1);   // stop with a failure code, so nobody thinks it's running
  }
  console.log(`API on http://localhost:${port}`);
});