const cookieParser = require('cookie-parser');

const cookie = (req, res) => {
    // const token = user.get
    
    let options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPRIES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }
   res.status(200).cookie('token', token,options)

}



module.exports = cookie