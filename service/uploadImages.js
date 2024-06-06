const multer = require('multer');
const path = require('path');
const appError = require("../service/appError");
const upload = multer({
    limits: {
        // 圖片檔案不超過2MB
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter(req, file, next) {
        const ext = path.extname(file.originalname).toLowerCase();
        // 限定上傳的圖片格式
        if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
            next(appError(400, "檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。"));
        }
        next(null, true);
    },
}).any();

module.exports = upload