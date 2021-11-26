const express = require('express');
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookie = require('../utilis/cookies');
const sendToken = require('../middleware/Auth');

exports.registerUser = async (req, res) => {
    try {
        secret = process.env.JWT
        const { name, email, password,role } = req.body;
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
            },role
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
            }).status(200).json({ message: "user Authenicated", user: user.email,userrole,token: token })
        }
    }
    catch (err) {
        res.status(400).json({ message: "Something went wrong", err });
        console.log(err)
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