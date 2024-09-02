class ExpressError extends Error{
    constructor(message, statusCode){
        super();
        this.message = message;
        this.sattusCode = statusCode;
    }
} 

module.exports = ExpressError;