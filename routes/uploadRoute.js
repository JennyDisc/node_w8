const express = require('express');
const router = express.Router();
const UploadController = require("../controller/uploadController");
const handleErrorAsync = require("../service/handleErrorAsync");
const { isAuth } = require("../service/auth");
const upload = require('../service/uploadImages');

// 上傳圖片功能
router.post('/', isAuth, upload, handleErrorAsync(UploadController.upload));

module.exports = router;