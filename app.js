const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const errorHandle = require("./service/errorHandle");
require('./connections/index');

// node.js 提供的"預期外的錯誤"
// 當程式遇到未捕捉的異常時就會被觸發，即捕捉同步的程式錯誤
// 如程式碼錯誤，如呼叫的函式內故意使用未定義的變量就會引發異常
process.on('uncaughtException', err => {
    // 記錄錯誤下來，等到服務都處理完後，停掉該 process
    console.error('Uncaughted Exception！')
    console.error(err);
    process.exit(1);
});

// 路由
const indexRouter = require('./routes/index');
const postsRouter = require('./routes/postRoute');
const usersRouter = require('./routes/usersRoute');
const uploadRoute = require('./routes/uploadRoute');

// 使用 express
const app = express();

// 使用 express 功能
app.use(logger('dev'));
// 跨域
app.use(cors())
// 解析 json 格式
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// 載入 cookie 的解析
app.use(cookieParser());
// 靜態網址路徑
app.use(express.static(path.join(__dirname, 'public')));

// 路由設計
app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use('/upload', uploadRoute);

// 404 路由錯誤
app.use(function (req, res, next) {
    errorHandle(res, 404, 'error', '無此頁面資訊', null);
});

// 正式環境 production 錯誤
const resErrorProd = (err, res) => {
    if (err.isOperational) {
        errorHandle(res, err.statusCode, err.status, err.message, null);
    } else {
        console.error('出現重大錯誤', err);
        // 送出罐頭預設訊息
        errorHandle(res, 500, 'error', '系統錯誤，請恰系統管理員', null);
    }
};

// 開發環境 development 錯誤
// 所有開發環境( npm run start:dev )中的錯誤都會由這邊錯誤處理
const resErrorDev = (err, res) => {
    errorHandle(res, err.statusCode, err, err.message, err.stack);
};

// 處理錯誤(如程式撰寫錯誤、try catch 的 catch 錯誤)
app.use(function (err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    // 開發環境 development
    if (process.env.NODE_ENV === 'dev') {
        return resErrorDev(err, res);
    }
    // 正式環境 production
    // isAxiosError 是 axios 套件提供的錯誤屬性
    if (err.isAxiosError === true) {
        err.message = "axios 連線錯誤";
        err.isOperational = true;
        return resErrorProd(err, res)
    }
    // ValidationError 是 mongoose 驗證產生的相關錯誤
    else if (err.name === 'ValidationError') {
        // mongoose 資料辨識錯誤
        err.message = "資料欄位未填寫正確，請重新輸入！";
        err.isOperational = true;
        err.statusCode = err.statusCode || 400;
        return resErrorProd(err, res)
    }
    // SyntaxError 資料格式錯誤
    // POST 與 PATCH API，body 寫 "content": 
    else if (err.name === 'SyntaxError') {
        err.message = "資料格式錯誤";
        err.isOperational = true;
        return resErrorProd(err, res)
    }
    // 自訂上傳圖片檔案限制的錯誤回傳
    else if (err.message === 'File too large') {
        err.message = "圖片檔案不得超過2MB";
        err.isOperational = true;
        return resErrorProd(err, res)
    }
    resErrorProd(err, res)
});

// node.js 提供的"預期外的錯誤"
// 如沒有加上 catch 捕捉，錯誤就會觸發、
process.on('unhandledRejection', (err, promise) => {
    console.error('未捕捉到的 rejection：', promise, '原因：', err);
});

module.exports = app;