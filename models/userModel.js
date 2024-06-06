const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, '貼文姓名未填寫']
        },
        sex: {
            type: String,
            enum: ["male", "female"]
        },
        email: {
            type: String,
            required: [true, 'email 未填寫'],
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: [true, '請輸入密碼'],
            minlength: 8,
            select: false
        },
        photo: {
            type: String,
            default: ""
        },
        followList: {
            type: String
        },
        likeArticle: {
            type: String
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        // 追蹤
        followers: [
            {
                user: { type: mongoose.Schema.ObjectId, ref: 'user' },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        following: [
            {
                user: { type: mongoose.Schema.ObjectId, ref: 'user' },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        versionKey: false,
    }
);

// 建立 model
const User = mongoose.model('user', userSchema);

module.exports = User;
