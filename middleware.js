// 'schemas.js'에서 campgroundSchema와 reviewSchema를 가져옵니다.
// 이 스키마들은 캠프장과 리뷰 데이터의 유효성을 검사하는 데 사용됩니다.
const { campgroundSchema, reviewSchema } = require('./schemas.js');

// 커스텀 에러 클래스를 가져옵니다. ExpressError는 특정 상황에서 에러를 발생시키는 데 사용됩니다.
const ExpressError = require('./seeds/utils/expressError.js');

// Campground와 Review 모델을 가져옵니다. 이 모델들은 MongoDB 데이터베이스와 상호작용하는 Mongoose 모델입니다.
const Campground = require('./models/campground');
const Review = require('./models/review');

// 사용자가 로그인했는지 확인하는 미들웨어입니다.
module.exports.isLoggedIn = (req, res, next) => {
    // 사용자가 인증되지 않은 경우
    if (!req.isAuthenticated()) {
        // 사용자가 로그인 후 돌아가야 할 URL을 세션에 저장합니다.
        req.session.returnTo = req.originalUrl;
        // 플래시 메시지를 통해 에러 메시지를 사용자에게 알립니다.
        req.flash('error', 'You must be signed in first!');
        // 로그인 페이지로 리다이렉트합니다.
        return res.redirect('/login');
    }
    // 사용자가 로그인되어 있으면 다음 미들웨어로 넘어갑니다.
    next();
};

// 캠프장 데이터를 유효성 검사하는 미들웨어입니다.
module.exports.validateCampground = (req, res, next) => {
    // req.body에 담긴 캠프장 데이터를 스키마를 통해 유효성 검사합니다.
    const { error } = campgroundSchema.validate(req.body);
    console.log(req.body); // 유효성 검사를 위한 디버깅 목적으로 요청 본문을 콘솔에 출력합니다.

    // 에러가 발생한 경우
    if (error) {
        // 에러 메시지를 배열에서 문자열로 변환합니다.
        const msg = error.details.map(el => el.message).join(',');
        // 커스텀 ExpressError를 발생시키고 400 상태 코드를 반환합니다.
        throw new ExpressError(msg, 400);
    } else {
        // 에러가 없으면 다음 미들웨어로 넘어갑니다.
        next();
    }
}

// 사용자가 해당 캠프장의 작성자인지 확인하는 미들웨어입니다.
module.exports.isAuthor = async(req, res, next) => {
    // 요청 파라미터에서 캠프장 ID를 추출합니다.
    const { id } = req.params;
    // ID를 사용해 데이터베이스에서 해당 캠프장을 찾습니다.
    const campground = await Campground.findById(id);   

    // 캠프장의 작성자와 현재 로그인한 사용자가 동일하지 않으면
    if (!campground.author.equals(req.user._id)) {
        // 플래시 메시지로 에러를 알리고
        req.flash('error', 'You do not have permission to do that');
        // 사용자를 해당 캠프장 페이지로 리다이렉트합니다.
        return res.redirect(`/campgrounds/${id}`);
    }
    // 사용자가 작성자라면 다음 미들웨어로 넘어갑니다.
    next();
}

// 사용자가 해당 리뷰의 작성자인지 확인하는 미들웨어입니다.
module.exports.isReviewAuthor = async(req, res, next) => {
    // 요청 파라미터에서 캠프장 ID와 리뷰 ID를 추출합니다.
    const { id, reviewId } = req.params;
    // 리뷰 ID를 사용해 데이터베이스에서 해당 리뷰를 찾습니다.
    const review = await Review.findById(reviewId);   

    // 리뷰의 작성자와 현재 로그인한 사용자가 동일하지 않으면
    if (!review.author.equals(req.user._id)) {
        // 플래시 메시지로 에러를 알리고
        req.flash('error', 'You do not have permission to do that');
        // 사용자를 해당 캠프장 페이지로 리다이렉트합니다.
        return res.redirect(`/campgrounds/${id}`);
    }
    // 사용자가 작성자라면 다음 미들웨어로 넘어갑니다.
    next();
}

// 사용자가 이전에 가고자 했던 URL을 저장하는 미들웨어입니다.
module.exports.storeReturnTo = (req, res, next) => {
    // 세션에 returnTo 값이 있으면
    if (req.session.returnTo) {
        // 이 값을 로컬 변수로 설정하여 뷰에서 사용할 수 있게 합니다.
        res.locals.returnTo = req.session.returnTo;
    }
    // 다음 미들웨어로 넘어갑니다.
    next();
}

// 리뷰 데이터를 유효성 검사하는 미들웨어입니다.
module.exports.validateReview = (req, res, next) => {
    // req.body에 담긴 리뷰 데이터를 스키마를 통해 유효성 검사합니다.
    const { error } = reviewSchema.validate(req.body);

    // 에러가 발생한 경우
    if (error) {
        // 에러 메시지를 배열에서 문자열로 변환합니다.
        const msg = error.details.map(el => el.message).join(',');
        // 커스텀 ExpressError를 발생시키고 400 상태 코드를 반환합니다.
        throw new ExpressError(msg, 400);
    } else {
        // 에러가 없으면 다음 미들웨어로 넘어갑니다.
        next();
    }
}
