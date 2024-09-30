const express = require('express');  // Express 모듈을 가져와서 라우터 생성
const router = express.Router();  // 새로운 라우터 인스턴스 생성
const passport = require('passport');  // Passport 모듈을 가져와서 인증 처리
const catchAsync = require('../seeds/utils/catchAsync');  // 비동기 함수 에러 처리를 위한 유틸리티
const User = require('../models/user');  // User 모델을 가져와서 데이터베이스와 상호작용
const users = require('../controllers/users');  // 사용자 관련 컨트롤러 함수들을 가져옴
const { storeReturnTo } = require('../middleware');  // 'storeReturnTo' 미들웨어를 가져옴

// 사용자 등록 라우트
router.route('/register')
    .get(users.renderRegister)  // 사용자 등록 페이지를 렌더링하는 GET 요청 핸들러
    .post(catchAsync(users.register));  // 사용자 등록 처리 POST 요청 핸들러, 비동기 에러 처리를 위해 catchAsync 사용

// 사용자 로그인 라우트
router.route('/login')
    .get(users.renderLogin)  // 사용자 로그인 페이지를 렌더링하는 GET 요청 핸들러
    .post(
        passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),  // 로그인 인증 처리
        users.login  // 인증 후 로그인 처리
    );

// 사용자 로그아웃 라우트
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {  // 사용자의 세션을 로그아웃 처리
        if (err) {
            return next(err);  // 로그아웃 과정에서 에러가 발생하면 에러 처리 미들웨어로 전달
        }
        req.flash('success', 'Goodbye!');  // 로그아웃 후 성공 메시지 플래시
        res.redirect('/campgrounds');  // 캠프그라운드 페이지로 리디렉션
    });
});

module.exports = router;  // 라우터 모듈을 내보내어 다른 파일에서 사용할 수 있도록 함
