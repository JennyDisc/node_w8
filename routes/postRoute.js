const express = require('express');
const router = express.Router();
const PostController = require("../controller/postController");
const handleErrorAsync = require("../service/handleErrorAsync");
const { isAuth } = require("../service/auth");

router.get('/', function (req, res, next) {
  PostController.getPosts(req, res);
});

// 縮寫
// router.get('/', PostController.getPosts) 

router.post('/', handleErrorAsync(PostController.postPosts));

router.delete('/', function (req, res, next) {
  PostController.deleteAllPosts(req, res, next);
});

router.delete('/:id', handleErrorAsync(PostController.deletePosts));

router.patch('/:id', handleErrorAsync(PostController.patchPosts));

// 新增貼文的留言
router.post('/:id/comment', isAuth, handleErrorAsync(PostController.postComment));

// 取得個人所有貼文
router.get('/user/:id', isAuth, handleErrorAsync(PostController.getMyPost));

// 新增一則貼文的讚
router.post('/:id/like', isAuth, handleErrorAsync(PostController.postAddLike));

// 取消一則貼文的讚
router.delete('/:id/unlike', isAuth, handleErrorAsync(PostController.deleteLike));


module.exports = router;
