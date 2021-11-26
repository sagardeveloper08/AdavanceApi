const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetpassword: String,
    resetpasswordExpire: Date
})

userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT, {
        expiresIn: '7d'
    })
}

// userSchema.methods.getResetpasswordToken = function () {
//     const resetToken = crypto.randomBytes(20).toString('hex')

//     this.resetpassword = crypto.createHash('sha256').update(resetToken).digest('hex')

//     this.resetpasswordExpire = Date.now() + 30 * 60 * 1000
//     return resetToken
// }
module.exports = mongoose.model('User', userSchema)
