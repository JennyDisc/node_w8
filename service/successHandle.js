function successHandle(res, newPost, message, comments) {
    const responseObject = {
        "status": "success",
    };
    if (message) {
        responseObject.message = message
    } else {
        // 判斷傳入的 fileUrl 是否為 'http://' 或 'https://'，是則將變數名稱取為 fileUrl
        if (typeof newPost === 'string' && (newPost.startsWith('http://') || newPost.startsWith('https://'))) {
            responseObject.fileUrl = newPost;
        } else {
            if (comments) {
                responseObject.data = { comments: comments };
                return res.status(201).send(responseObject);
            } else {
                responseObject.data = newPost;
            }
        };
    }
    // 回傳成功預設狀態200，這邊還是寫出來
    res.status(200).send(responseObject);

};

module.exports = successHandle;