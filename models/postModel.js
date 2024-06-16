const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        // 讓 posts 與 users 這兩個 collection 產生關聯，並帶入使用者的 ObjectId。用關聯取代原本的 name 欄位
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'user',
            required: [true, '使用者 ID 未填寫']
        },
        // 新增欄位
        location: {
            type: String,
            required: [true, '發文所在地未填寫'],
            select: false
        },
        type: {
            type: String,
            enum: ['group', 'person'],
            required: [true, '貼文類型未填寫']
        },
        tags: {
            type: String,
            required: [true, '貼文標籤未填寫'],
        },
        content: {
            type: String,
            required: [true, 'Content 未填寫']
        },
        image: {
            type: String,
            default: ""
        },
        createdAt: {
            type: Date,
            default: Date.now,
            // select: false
        },
        likes: [{
            type: mongoose.Schema.ObjectId,
            ref: 'user',
        }],
    },
    {
        versionKey: false,
        // 虛擬欄位
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// 虛擬欄位 comments
postSchema.virtual('comments', {
    ref: 'comment',
    foreignField: 'post',
    localField: '_id'
});

// 建立 model
const Post = mongoose.model('post', postSchema);

module.exports = Post;
