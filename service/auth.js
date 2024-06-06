const express = require('express');
// JWT 產生與驗證
const jwt = require('jsonwebtoken');
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
const User = require("../models/userModel");

// 模組
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

// JWT 產生
const generateSendJWT = (user, statusCode, res) => {
    // 產生 JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_DAY
    });
    // 清除使用者密碼，避免密碼洩漏
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        user: {
            token,
            name: user.name
        }
    });
};

// JWT 驗證
const isAuth = handleErrorAsync(async (req, res, next) => {
    // 確認 token 是否存在
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(appError(401, '您尚未登入！', next));
    }

    // 驗證 token 正確性，並取得 payload 內容(id)
    const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if (err) {
                return next(appError(401, 'jwt expired', next));
            } else {
                resolve(payload)
            }
        })
    })
    const currentUser = await User.findById(decoded.id);
    req.user = currentUser;
    next();
});

module.exports = {
    isAuth,
    generateSendJWT
};