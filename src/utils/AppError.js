//An error we expect and can explain to the user , e.g. "Email already registered".
//Anything that is NOT an AppError is treated as a bug and with a 500.
class AppError extends Error{
    constructor(status, message){
        super(message);          //let Error set up .message and the stack trace.
        this.name= 'AppError';   // shows as "AppError:..." in the logs instead of "Error:..."
        this.status= status;     // the HTTP status code to send : 400, 401, 403, 404, 409.
    }
}

module.exports= AppError;