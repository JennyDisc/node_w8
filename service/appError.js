const appError = (httpStatus, errMessage, next) => {
    const error = new Error(errMessage);
    error.statusCode = httpStatus;
    // isOperational 是否為可預期錯誤，true 表示可預期
    error.isOperational = true;
    return error;
}

module.exports = appError;