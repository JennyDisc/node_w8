const express = require('express');
const appError = require("../service/appError");
const successHandle = require("../service/successHandle");

// 可使用 uuid 產生檔案名稱唯一值，避免產生重複的檔案名稱（記得需加上副檔名）
const { v4: uuidv4 } = require('uuid');
const firebaseAdmin = require('../service/firebase');
// 取出存儲桶內容
const bucket = firebaseAdmin.storage().bucket();

const uploadController = {
    async upload(req, res, next) {
        if (!req.files.length) {
            return next(appError(400, "尚未上傳檔案"));
        }
        // 取得上傳的檔案資訊列表裡面的第一個檔案
        const file = req.files[0];
        // name: 要存放在儲存桶中的檔案名稱
        // 若要將檔案上傳至特定的資料夾，可以設定：
        // 建立一個 blob 物件，來存放我們要上傳的檔案
        // bucket.file('images/...')，這樣就會將圖片存放到 images 資料夾下
        // ()內使用 uuid 為圖片重新命名，避免原始圖片名稱進到後端發生撞名
        const blob = bucket.file(`images/${uuidv4()}.${file.originalname.split('.').pop()}`);
        const blobStream = blob.createWriteStream()

        // 建立一個可以寫入 blob 的物件（Writable 可寫入流），讓我們可以在儲存桶中建立檔案
        // 使用此物件來監聽檔案的上傳狀態監聽上傳狀態，當上傳完成時，會觸發 finish 事件
        // getSignedUrl 第一個參數為 config 用來設定檔案的存取權限
        // action、expires 皆為必填
        blobStream.on('finish', () => {
            // 設定檔案的存取權限
            const config = {
                action: 'read', // 權限
                expires: '12-31-2500', // 網址的有效期限
            };
            // 可以在觸發完成事件後取得檔案的網址 
            // getSignedUrl(config, callback)，當上傳完成時，會觸發 finish 事件
            // 取得檔案網址 fileUrl
            blob.getSignedUrl(config, (err, fileUrl) => {
                successHandle(res, fileUrl, null)
            });
        });

        // 如果上傳過程中發生錯誤，會觸發 error 事件
        blobStream.on('error', (err) => {
            console.log('hhh')
            next(appError(500, "上傳失敗"));
        });

        // 寫入最後檔案時 buffer 關閉 blobStream
        // 將檔案的 buffer 寫入 blobStream
        blobStream.end(file.buffer);
    }
};

module.exports = uploadController;