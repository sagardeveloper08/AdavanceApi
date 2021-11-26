class ErrorHandler extends console.error {
    constructor(message, statuscode) {
        super(message);
        this.statuscode = statuscode

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = ErrorHandler