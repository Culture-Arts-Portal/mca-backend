const AppError = require('../utils/AppError');

// Runs only when no route matched the resquest.
// It does'nt answer itself: it passes a 404 AppError to the error handler.
module.exports = ( req, res, next) =>
    next(new AppError( 404, `No route for ${req.method} ${req.path}`));