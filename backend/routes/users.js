const express = require('express')
const router = express.Router()

const UserController = require('../controllers/userController');

router.post('/register', UserController.registerUser)

router.post('/login', UserController.isLogin)

router.get('/logout', UserController.Logout)

router.post('/forgetpasssword', UserController.forgotPassword)
router.put('/password/reset/:token', UserController.resetPassword)
module.exports = router