const express = require('express');  // Express 모듈을 가져와서 라우터 생성
const router = express.Router({ mergeParams: true });  // 새로운 라우터 인스턴스 생성, 부모 라우트의 파라미터를 자식 라우트에 병합
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');  // 미들웨어 함수들을 가져옴
const Campground = require('../models/campground');  // Campground 모델을 가져와서 데이터베이스와 상호작용
const Review = require('../models/review');  // Review 모델을 가져와서 데이터베이스와 상호작용
const reviews = require('../controllers/reviews');  // 리뷰 관련 컨트롤러 함수들을 가져옴
const ExpressError = require('../seeds/utils/expressError');  // 커스텀 에러 처리를 위한 클래스
const catchAsync = require('../seeds/utils/catchAsync');  // 비동기 함수 에러 처리를 위한 유틸리티

// 리뷰 생성 라우트
router.post('/', 
    isLoggedIn,  // 사용자가 로그인했는지 확인하는 미들웨어
    validateReview,  // 리뷰 데이터의 유효성을 검사하는 미들웨어
    catchAsync(reviews.createReview)  // 리뷰 생성 처리, 비동기 에러 처리를 위해 catchAsync 사용
);

// 리뷰 삭제 라우트
router.delete('/:reviewId', 
    isLoggedIn,  // 사용자가 로그인했는지 확인하는 미들웨어
    isReviewAuthor,  // 리뷰의 작성자인지 확인하는 미들웨어
    catchAsync(reviews.deleteReview)  // 리뷰 삭제 처리, 비동기 에러 처리를 위해 catchAsync 사용
);

module.exports = router;  // 라우터 모듈을 내보내어 다른 파일에서 사용할 수 있도록 함
