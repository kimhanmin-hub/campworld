const express = require('express');  // Express 모듈을 가져와서 라우터 생성
const router = express.Router();  // 새로운 라우터 인스턴스 생성
const campgrounds = require('../controllers/campgrounds');  // 캠프그라운드 관련 컨트롤러 함수들 가져오기
const catchAsync = require('../seeds/utils/catchAsync');  // 비동기 함수에서 발생하는 에러를 처리하기 위한 유틸리티
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');  // 미들웨어 함수들 가져오기
const multer = require('multer');  // 파일 업로드를 처리하기 위한 multer 모듈
const { storage } = require('../cloudinary');  // Cloudinary에 대한 설정 가져오기
const upload = multer({ storage });  // multer 설정 초기화

const Campground = require('../models/campground');  // Campground 모델 가져오기

// 캠프그라운드 목록과 새 캠프그라운드 생성
router.route('/')
    .get(catchAsync(campgrounds.index))  // 캠프그라운드 목록을 렌더링하는 핸들러
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))  // 새 캠프그라운드 생성 처리

// 새로운 캠프그라운드 폼 렌더링
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

// 특정 캠프그라운드에 대한 정보 보기, 업데이트 및 삭제
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))  // 특정 캠프그라운드 정보를 렌더링하는 핸들러
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))  // 캠프그라운드 업데이트 처리
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));  // 캠프그라운드 삭제 처리

// 캠프그라운드 편집 폼 렌더링
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

// 캠프그라운드 정보를 표시하는 핸들러 (컨트롤러에서 직접 정의됨)
module.exports.showCampground = async (req, res, next) => {
    try {
        const campground = await Campground.findById(req.params.id)
            .populate({
                path: 'reviews',  // 리뷰 정보 가져오기
                populate: {
                    path: 'author'  // 리뷰 작성자 정보도 함께 가져오기
                }
            })
            .populate('author');  // 캠프그라운드 작성자 정보 가져오기
        
        if (!campground) {
            req.flash('error', '캠프그라운드를 찾을 수 없습니다!');  // 캠프그라운드를 찾을 수 없는 경우 에러 메시지 플래시
            return res.redirect('/campgrounds');  // 캠프그라운드 목록 페이지로 리디렉션
        }
        
        res.render('campgrounds/show', { campground });  // 캠프그라운드 정보를 렌더링하여 응답
    } catch (err) {
        next(err);  // 에러를 다음 미들웨어로 전달
    }
}

module.exports = router;  // 라우터 모듈을 내보내어 다른 파일에서 사용할 수 있도록 함
