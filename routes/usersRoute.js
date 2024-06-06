const express = require('express');
const router = express.Router();
const UserController = require("../controller/userController");
const handleErrorAsync = require("../service/handleErrorAsync");
const { isAuth } = require("../service/auth");

// 註冊
router.post('/sign_up', handleErrorAsync(UserController.postSignUp));

// 登入
router.post('/sign_in', handleErrorAsync(UserController.postSignIn));

// 重設密碼
// 情境通常是使用者已登入的狀態，使用 isAuth 來驗證身份
router.post('/updatePassword', isAuth, handleErrorAsync(UserController.postPassword));

// 取得個人資料
router.get('/profile', isAuth, function (req, res, next) {
  UserController.getUser(req, res);
});

// 縮寫
// router.get('/', isAuth, UserController.getUser) 

// 更新個人資料
router.patch('/profile', isAuth, handleErrorAsync(UserController.patchUser));

// 追蹤
router.post('/:id/follow', isAuth, handleErrorAsync(UserController.postFollow));

// 取消追蹤
router.delete('/:id/unfollow', isAuth, handleErrorAsync(UserController.deleteUnfollow));

// 取得個人的所有追蹤名單
router.get('/following', isAuth, handleErrorAsync(UserController.getFollow));

// 取得個人按讚的貼文
router.get('/getLikeList', isAuth, handleErrorAsync(UserController.getLikeList));

module.exports = router;
