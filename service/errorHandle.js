function errorHandle(res, statusCode, status, message, stack) {
    const statusValue = status ? status : 'false';
    const responseObject = {
        "status": statusValue,
        "message": message
    };
    if (stack) {
        responseObject.stack = stack
    };
    res.status(statusCode).send(responseObject);
};

module.exports = errorHandle;