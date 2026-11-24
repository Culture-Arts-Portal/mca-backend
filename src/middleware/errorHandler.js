const AppError = require('../utils/AppError');
const { nodeEnv } = require ('../config/env');

//Every error ends here. Express knows this is the error handler
// because it has FOUR arguements , so keep "next" even though it's unused .
// Every error answer has the shape agreed in API.md: { success: false, data: null, message }

module.exports = ( err, req, res, next) => {
    //1. Our own sorry card: show its status and message
    if (err instanceof AppError) {
        return res.status(err.status).json({ success: false, data: null, message: err.message });
    }

    //2. The browser sent broken JSON
    if (err.type === 'entity.parse.failed'){
        return res.status(400).json({ success: false, data: null, message: 'Request body is not valid JSON' });
    }

    //3. Anything else is a bug: log the details for us , keep the user's message vague.
    console.error(err);
    const message = nodeEnv === 'production' ? 'Something went wrong' : err.message;
    res.status(500).json({ success: false, data: null, message });
};
