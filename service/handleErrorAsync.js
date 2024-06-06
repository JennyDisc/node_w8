const handleErrorAsync = function handleErrorAsync(func) {
    // 先將原本的 async function 內容作為參數帶進 func
    // middleware 先接住 router 資料
    return function (req, res, next) {
      // 再返回並執行一個新函式，將前面帶入的 func 函式加上 catch 統一捕捉錯誤
      // 由於 async 本身就是 promise，所以可用 catch 去捕捉
      func(req, res, next).catch(
        function (error) {
            return next(error);
        }
      );
    };
  };
  
  module.exports = handleErrorAsync;