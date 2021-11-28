const express = require('express');
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// const cookie = require('../utilis/cookies');
// const sendToken = require('../middleware/Auth');
// const user = require('../models/user');
// const user = require('../models/user');
const sendEmail = require('../utilis/sendEmail')
const crypto = require('crypto')

exports.registerUser = async (req, res) => {
    try {
        secret = process.env.JWT
        const { name, email, password, role } = req.body;
        let findusers = await User.findOne({ email: req.body.email })
        if (findusers) {
            res.status(401).json('users already present')
        }
        const users = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: 'cyz',
                url: "https,"
            }, role
        })
        if (!users) {
            res.status(400).json({ messgae: "Failed to fetch user" })
        }

        if (users) {
            const token = users.getJwtToken()
            console.log(token)
            const salt = await bcrypt.genSalt(10);
            users.password = await bcrypt.hash(users.password, salt);
            await users.save()
            res.cookie("token", token, {
                expries: new Date(
                    Date.now() + process.env.CookieExpries * 24 * 60 * 60 * 1000
                ), httpOnly: true
            }).json({
                message: true,
                users, token
            })
        }
    } catch (err) {
        console.log(err, 'error')
    }
}

exports.isLogin = async (req, res) => {
    try {
        // const secret = process.env.JWT
        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            res.status(400).json({ message: "user not found" })
        }
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!validPassword) {
            res.status(400).json({ message: "password wrong" })
        }
        if (validPassword) {
            const token = user.getJwtToken()
            // console.log(token)
            let userrole = user.role
            res.cookie('token', token, {
                expries: new Date(
                    Date.now() + process.env.CookieExpries * 24 * 60 * 60 * 1000
                ), httpOnly: true
            }).status(200).json({ message: "user Authenicated", user: user.email, userrole, token: token })
        }
    }
    catch (err) {
        console.log(err)
        res.status(400).json({ message: "Something went wrong", err });
       
    }
}


exports.Logout = async (req, res) => {
    try {
        res.clearCookie('token', null, {
            expries: new Date(Date.now()),
            httpOnly: true
        })
        res.status(200).json(
            {
                message: "logout sucessfully",
            }
        )
    } catch (err) {
        res.status(400).json({ message: "Something went wrong", err });
        console.log(err)
    }
}

// forget password
exports.forgotPassword = async (req, res, next) => {
    const userEmail = await User.findOne({ email: req.body.email })

    if (!userEmail) {
        return next(res.status(400).json({ message: "Inavlid email" }))
    }
    // function getResetpasswordToken() {

    //     console.log(resetToken, 'r')
    //     resetpasswordExpire = Date.now() + 30 * 60 * 1000
    // }
    // const resetToken = (Math.random() + 1).toString(36).substring(7)
    // const resetpasswordExpire = Date.now() + 30 * 60 * 1000
    // console.log(resetToken)
    if (userEmail) {
        const token = userEmail.reset()
        await userEmail.save({ validateBeforeSave: false })

        const resetUrl = `${req.protocol}://${req.get('host')}/api/password/reset/${token}`;

        const message = `your password reset token is followed:\n ${resetUrl}\n if you are not please ingonre`
        console.log(message)
        try {
            await sendEmail({
                email: req.body.email,
                subject: "password reset ",
                message
            })
            console.log(req.body.email, 'emal')
            res.status(200).json({ message: "email send sucessfully" })
        } catch (err) {

            User.getResetpasswordToken = undefined;
            User.resetpasswordExpire = undefined;
            await userEmail.save({ validateBeforeSave: false })
            console.log(err)
            res.status(400).json({ message: "error while sending email", err })
        }
    }

}

// reset password
exports.resetPassword = async (req, res, next) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

        const user = await User.findOne({
            resetPasswordToken,
            resetpasswordExpire: { $gt: Date.now() }
        })
        if (!user) {
            return next(res.status(400).json({ mesage: "password token invalid or expried", }))
        }
        if (!req.body.password == req.body.confirmpassword) {
            return next(res.status(400).json({ message: "password and confirm password dont match" }))
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        console.log('password', user.password)
        user.resetpassword = undefined;
        user.resetpasswordExpire = undefined;


        await user.save()
        res.status(200).json({ message: "password reset ,!go back and login", resetPasswordToken })
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: "token invalid ! something went wrong" })
    }
}


// details of users cureently logged in

exports.getUserDetails = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
        res.status(200).json({ message: "user fetch sucessfully", user })
    } catch (err) {
        console.log(err)
        res.status(400).json({ messagar: "something went wrong kindly check it" })
    }

}

//

exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password')
        if (!user) {
            res.status(401).json({ message: "user not found" })
        }
        const isMatched = await user.comparePassword(req.body.oldPassword)
        if (!isMatched) {
            return next(res.status(400).json({ message: "old password is incorrect" }))
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        await user.save();
        res.status(200).json({ message: "password update sucessfuly" })
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: "something went wrong" })
    }
}

// update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const newUserData = {
            name: req.body.name,
            email: req.body.email
        }
        const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: "false"
        })
        if (user) {
            res.status(200).json({ message: "user update sucessfully", user })
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({ messgae: "something went wrong " })
    }
}

// get all user by admin
exports.allUser = async (req, res) => {
    try {
        const user = await User.find()
        if (user) {
            res.status(200).json({ count: user.length, message: "user fetch sucessfully", user })
        }
    } catch (err) {
        res.status(400).json({ messgae: "cant find user data " })
    }
}

exports.getDetails = async (req, res) => {
    try {
        const userById = await User.findById(req.params.id)
        if (userById) {
            res.status(200).json({ messgae: "fetch data", userById })
        }
    }
    catch {
        res.status(400).json({ messgae: "something went wrong" })
    }
}

exports.updateUser = async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            email: req.body.email,
        }
        const userUpdate = await User.findByIdAndUpdate(req.user.id, updateData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })
        if (userUpdate) {
            res.status(200).json({ mesage: "user update sucessfully", userUpdate })
        }
    } catch (err) {
        res.status(400).json({ message: "user data not update" })
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            res.status(400).json({ message: "User not found" })
        }

        const userDelete = await User.findByIdAndDelete(req.params.id)
        if (!userDelete) {
            res.status(400).json({ message: "user not Deleted" })
        }
        res.status(200).json({ message: "user data deleted sucessfully", userDelete })
    }
    catch (err) {
        console.log(err)
        res.status(400).json({message:"something went wrong"})
    }
}