const ErrorHandler = require('../utilis/ErrorHandler')


module.exports = (err, req, res, next) => {
    err.statuscode = err.statuscode || 500;
    err.message = err.message || "internal server error";

    res.status(err.statuscode).json({
        sucess : false,
        error : err
    })
}