// 비동기 함수를 처리하기 위한 미들웨어 래퍼를 정의하는 모듈
module.exports = func => {
    // 반환된 미들웨어 함수
    return (req, res, next) => {
        // 주어진 함수(func)를 호출하고, 에러가 발생할 경우 next()를 통해 에러를 처리
        func(req, res, next).catch(next);
    };
};

// 'storeReturnTo' 미들웨어 정의
module.exports.storeReturnTo = (req, res, next) => {
    // 세션에 'returnTo' 값이 존재하는 경우
    if (req.session.returnTo) {
        // 'returnTo' 값을 'res.locals'에 저장하여 뷰 템플릿에서 사용할 수 있도록 함
        res.locals.returnTo = req.session.returnTo;
    }
    // 다음 미들웨어로 제어를 넘김
    next();
}
    