const Campground = require('../models/campground');
const Review = require('../models/review');

// 리뷰 생성
module.exports.createReview = async (req, res) => {
    // 캠프그라운드 ID를 기반으로 캠프그라운드 찾기
    const campground = await Campground.findById(req.params.id);
    
    // 요청 본문에서 리뷰 데이터 추출하여 새 리뷰 객체 생성
    const review = new Review(req.body.review);
    review.author = req.user._id;  // 현재 로그인한 사용자를 리뷰 작성자로 설정
    
    // 캠프그라운드의 리뷰 배열에 새 리뷰 추가
    campground.reviews.push(review);
    
    // 리뷰와 캠프그라운드 객체 저장
    await review.save();
    await campground.save();
    
    // 성공 플래시 메시지 설정
    req.flash('success', 'Created new review!');
    
    // 캠프그라운드 상세 페이지로 리다이렉트
    res.redirect(`/campgrounds/${campground._id}`);
}

// 리뷰 삭제
module.exports.deleteReview = async (req, res) => {
    // URL 파라미터에서 캠프그라운드 ID와 리뷰 ID 추출
    const { id, reviewId } = req.params;
    
    // 캠프그라운드에서 해당 리뷰를 제거
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    
    // 리뷰를 삭제
    await Review.findByIdAndDelete(reviewId);
    
    // 성공 플래시 메시지 설정
    req.flash('success', 'Successfully deleted review');
    
    // 캠프그라운드 상세 페이지로 리다이렉트
    res.redirect(`/campgrounds/${id}`);
}
