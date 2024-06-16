const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        comment: {
            type: String,
            required: [true, 'comment 內容不可為空值!']
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'user',
            require: ['true', 'user must belong to a post.']
        },
        post: {
            type: mongoose.Schema.ObjectId,
            ref: 'Post',
            require: ['true', 'comment must belong to a post.'],
        }
    }, { versionKey: false }
);

commentSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name id createdAt'
    });

    next();
})

// 建立 model
const Comment = mongoose.model('comment', commentSchema);

module.exports = Comment;
