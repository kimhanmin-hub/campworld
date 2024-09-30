const User = require('../models/user');

// 사용자 등록 페이지 렌더링
module.exports.renderRegister = (req, res) => {
    res.render('users/register');  // 'users/register' 뷰를 렌더링
}

// 사용자 등록 처리
module.exports.register = async (req, res, next) => {
    try {
        // 요청 본문에서 이메일, 사용자 이름, 비밀번호 추출
        const { email, username, password } = req.body;
        
        // 새 사용자 생성
        const user = new User({ email, username });
        
        // 사용자를 등록하고 로그인 처리
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);  // 로그인 중 오류가 발생하면 에러 처리
            req.flash('success', 'Welcome to Yelp Camp!');  // 성공 메시지 설정
            res.redirect('/campgrounds');  // 캠프그라운드 페이지로 리다이렉트
        });
    } catch (e) {
        req.flash('error', e.message);  // 에러 메시지를 플래시 메시지로 설정
        res.redirect('register');  // 등록 페이지로 리다이렉트
    }
}

// 로그인 페이지 렌더링
module.exports.renderLogin = (req, res) => {
    res.render('users/login');  // 'users/login' 뷰를 렌더링
}

// 로그인 처리
module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');  // 로그인 성공 메시지 설정
    const redirectUrl = req.session.returnTo || '/campgrounds';  // 세션에 저장된 URL로 리다이렉트, 없으면 기본 캠프그라운드 페이지
    delete req.session.returnTo;  // 세션에서 URL 삭제
    res.redirect(redirectUrl);  // 리다이렉트
}

// 로그아웃 처리
module.exports.logout = (req, res) => {
    req.logout();  // 사용자 로그아웃 처리
    req.flash('success', "Goodbye!");  // 로그아웃 성공 메시지 설정
    res.redirect('/campgrounds');  // 캠프그라운드 페이지로 리다이렉트
}
