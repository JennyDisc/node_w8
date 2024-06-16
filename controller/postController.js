const mongoose = require("mongoose");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const Comment = require("../models/commentsModel");
const successHandle = require("../service/successHandle");
const appError = require("../service/appError");

const postController = {
    async getPosts(req, res) {
        // 排序
        // asc 遞增(由小到大，由舊到新) createdAt ; 
        // desc 遞減(由大到小、由新到舊) "-createdAt"
        const timeSortData = req.query.timeSort === 'asc' ? 'createdAt' : '-createdAt';

        // 關鍵字查詢
        const keywords = req.query.keywords !== undefined ? { "content": new RegExp(req.query.keywords) } : {};

        const allposts = await Post.find(keywords).populate({
            path: 'user',
            select: 'name photo'
        }).populate({
            path: 'comments',
            select: 'comment user'
        }).sort(timeSortData);
        successHandle(res, allposts, null);
    },
    async getPost(req, res, next) {
        const id = req.params.id;
        const getPost = await Post.findById(id);
        if (getPost === null) {
            next(appError(400, "找不到貼文"));
        } else {
            const onePost = await Post.findById(id).populate({
                path: 'user',
                select: 'name photo'
            }).populate({
                path: 'comments',
                select: 'comment user'
            });
            successHandle(res, onePost, null);
        }
    },
    async postPosts(req, res, next) {
        const data = req.body;
        // users collection 裡查無要新增的這筆 user id 時會回傳 null
        const postCanDo = await User.findById(req.user.id, 'name').exec();
        // 輸入非 users collection 的 ID 時回傳 null (無法執行新增)
        if (postCanDo !== null) {
            if (data.content !== undefined && data.content.trim() !== "") {
                const newPost = await Post.create(
                    {
                        user: req.user.id,
                        location: data.location,
                        type: data.type,
                        tags: data.tags,
                        content: data.content.trim(),
                        image: data.image,
                    }
                );
                successHandle(res, newPost, null);
            } else {
                // 用 appError 自訂錯誤回饋
                next(appError(500, 'content 欄位未確實填寫，或無該筆貼文 id'));
            }
        } else {
            next(appError(400, '查無此用戶 id'));
        }
    },
    // DELETE 刪除單筆資料時，若未填寫 ID 路由為 "/posts/” 時，會刪除所有貼文。用 req.originalUrl 判斷路由是否為 "/posts/” ，是才執行
    async deleteAllPosts(req, res, next) {
        if (req.originalUrl !== "/posts/") {
            await Post.deleteMany();
            successHandle(res, null, '已刪除全部貼文');
        } else {
            next(appError(400, '查無該筆貼文 id'));
        }
    },
    async deletePosts(req, res, next) {
        const id = req.params.id;
        const idResult = await Post.findByIdAndDelete(id);
        // 找到可刪除的會回傳那筆的物件內容。找不到可刪除的則回傳 null
        if (idResult !== null) {
            successHandle(res, null, null);

        } else {
            next(appError(400, '查無該筆貼文 id'));
        };
    },
    async patchPosts(req, res, next) {
        const data = req.body;
        const id = req.params.id;
        const idResult = await Post.findById(id);
        // 找到這筆 id 會回傳那筆的物件內容。找不到則回傳 null
        if (data.content.trim() !== undefined && idResult !== null && data.content.trim() !== "") {
            // 寫法1
            // await Post.findByIdAndUpdate(
            //     id,
            //     {
            //         name: data.name,
            //         location: data.location,
            //         type: data.type,
            //         tags: data.tags,
            //         content: data.content.trim(),
            //         image: data.image,
            //         likes: data.likes
            //     }
            // );
            // const newPost = await Post.findById(id);

            // 寫法2
            const newPost = await Post.findByIdAndUpdate(
                id,
                {
                    name: data.name,
                    location: data.location,
                    type: data.type,
                    tags: data.tags,
                    content: data.content.trim(),
                    image: data.image,
                    likes: data.likes
                },
                { new: true, runValidators: true }
            );
            successHandle(res, newPost, null);
        } else {
            next(appError(400, '查無該筆貼文內容或 id 屬性'));
        };
    },
    // 新增貼文的留言
    async postComment(req, res, next) {
        const user = req.user.id;
        const post = req.params.id;
        const { comment } = req.body;
        // post collection 裡查無這筆 post id 時會回傳 null
        const postCommentCanDo = await Post.findById(post);
        if (postCommentCanDo !== null) {
            if (comment !== undefined && comment.trim() !== "") {
                const newComment = await Comment.create({
                    user,
                    post,
                    comment
                });
                successHandle(res, null, null, newComment);
            } else {
                next(appError(500, 'comment 欄位未確實填寫'));
            }
        } else {
            next(appError(400, '查無該筆貼文 id'));
        }
    },
    // 取得個人所有貼文
    async getMyPost(req, res, next) {
        const id = req.params.id;

        // 排序
        // asc 遞增(由小到大，由舊到新) createdAt ; 
        // desc 遞減(由大到小、由新到舊) "-createdAt"
        const timeSortData = req.query.timeSort === 'asc' ? 'createdAt' : '-createdAt';

        // post collection 裡查無這筆 user id 時會回傳 []
        const getCanDo = await Post.find({ user: id });
        if (getCanDo.length !== 0) {
            const posts = await Post.find({ user: id }).populate({
                path: 'user',
                select: 'name photo'
            }).populate({
                path: 'comments',
                select: 'comment user'
            }).sort(timeSortData);
            successHandle(res, posts, null);
        } else {
            next(appError(400, '查無此用戶 id 或 該用戶 id 沒有發表貼文'));
        }
    },
    // 新增一則貼文的讚
    async postAddLike(req, res, next) {
        const user = req.user.id;
        const post = req.params.id;
        // post collection 裡查無這筆 post id 時會回傳 null
        const postLikeCanDo = await Post.findById(post);
        // post collection 裡查無這筆 post id 裡 likes 欄位是否有此 user id ，無時回傳 []
        const likeState = await Post.find({
            $and: [
                { "_id": { $in: [post] } },
                { "likes": { $in: [req.user.id] } }
            ]
        })
        if (postLikeCanDo !== null) {
            if (likeState.length !== 0) {
                next(appError(400, '您已經按過讚'));
            } else {
                // 更新該則貼文的likes欄位
                const addLike = await Post.findOneAndUpdate(
                    { _id: post },
                    { $addToSet: { likes: user } },
                    { new: true, runValidators: true }
                );
                successHandle(res, addLike, null);
            }
        } else {
            next(appError(400, '查無該筆貼文 id'));
        }
    },
    // 取消一則貼文的讚
    async deleteLike(req, res, next) {
        const user = req.user.id;
        const post = req.params.id;
        // post collection 裡查無這筆 post id 時會回傳 null
        const postLikeCanDo = await Post.findById(post);
        // post collection 裡查無這筆 post id 裡 likes 欄位是否有此 user id ，無時回傳 []
        const likeState = await Post.find({
            $and: [
                { "_id": { $in: [post] } },
                { "likes": { $in: [req.user.id] } }
            ]
        })
        if (postLikeCanDo !== null) {
            if (likeState.length == 0) {
                next(appError(401, '您尚未按過讚'));
            } else {
                const removeLike = await Post.findByIdAndUpdate(
                    // 更新該則貼文的likes欄位
                    { _id: post },
                    { $pull: { likes: user } },
                    // { $pull: { likes: { $in: [user] } } },
                    { new: true, runValidators: true }
                );
                successHandle(res, removeLike, null);
            }
        } else {
            next(appError(400, '查無該筆貼文 id'));
        }
    },
};

module.exports = postController;

