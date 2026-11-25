// sends every successful answer in the shape agreed in the API.md:
// {success: true, dat: ...,message:...}
exports.ok=(res , data, message = 'OK', status = 200) =>
    res.status(status).json({success: true, data, message});    
