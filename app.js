// 개발 환경에서만 .env 파일을 로드하여 환경 변수를 설정
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// 환경 변수 확인을 위한 콘솔 출력 (개발 중에만 사용)
console.log(process.env.SECRET);
console.log(process.env.API_KEY);

const express = require('express');  // Express 모듈을 가져와서 서버 애플리케이션 생성
const path = require('path');  // 파일 및 디렉토리 경로를 다루기 위한 Path 모듈
const mongoose = require('mongoose');  // MongoDB와 상호작용하기 위한 Mongoose 모듈
const ejsMate = require('ejs-mate');  // EJS 템플릿 엔진을 사용하기 위한 레이아웃 패키지
const session = require('express-session');  // 세션 관리를 위한 미들웨어
const flash = require('connect-flash');  // 플래시 메시지 지원을 위한 미들웨어
const ExpressError = require('./seeds/utils/expressError');  // 커스텀 에러 처리를 위한 클래스
const methodOverride = require('method-override');  // HTML 폼에서 PUT, DELETE 등의 HTTP 메소드를 사용할 수 있게 하는 패키지
const passport = require('passport');  // 인증을 위한 Passport.js
const LocalStrategy = require('passport-local');  // Passport.js의 로컬 전략 모듈
const User = require('./models/user');  // 사용자 모델
const helmet = require('helmet');  // 보안 관련 HTTP 헤더 설정을 위한 패키지
const mongoSanitize = require('express-mongo-sanitize');  // NoSQL 인젝션 방어를 위한 미들웨어

// 라우트 모듈 가져오기
const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const MongoStore = require('connect-mongo');  // 세션 데이터를 MongoDB에 저장하기 위한 패키지

// MongoDB 연결 문자열 (개발 환경에서는 로컬 DB 사용)
const dburl = 'mongodb://localhost:27017/yelp-camp';

// MongoDB에 연결
mongoose.connect(dburl, {
    useNewUrlParser: true,  // 새로운 URL 파서 사용
    useUnifiedTopology: true,  // 새로운 서버 발견 및 모니터링 엔진 사용
});

// 데이터베이스 연결 상태를 변수에 저장
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));  // 연결 오류 발생 시 콘솔에 오류 메시지 출력
db.once("open", () => {  // 연결이 성공적으로 이루어졌을 때 메시지 출력
    console.log("Database connected");
});

const app = express();  // Express 애플리케이션 생성

// EJS 템플릿 엔진 설정
app.engine('ejs', ejsMate);  // ejsMate를 템플릿 엔진으로 사용하도록 설정
app.set('view engine', 'ejs');  // 뷰 엔진을 EJS로 설정
app.set('views', path.join(__dirname, 'views'));  // 템플릿 파일들이 위치할 디렉토리 설정

app.use(express.urlencoded({ extended: true }));  // 요청 본문에 포함된 데이터를 해석하기 위한 미들웨어 설정
app.use(methodOverride('_method'));  // 쿼리 문자열로 전달된 "_method" 값을 통해 HTTP 메소드 변경 가능
app.use(express.static(path.join(__dirname, 'public')));  // 정적 파일을 제공하기 위한 미들웨어
app.use(mongoSanitize({ replaceWith: '_' }));  // MongoDB 인젝션 방어

// MongoDB에 세션 데이터를 저장하기 위한 설정
const store = MongoStore.create({
    mongoUrl: dburl,  // 세션 데이터를 저장할 MongoDB URL
    touchAfter: 24 * 60 * 60,  // 24시간마다 세션을 업데이트
    crypto: {
        secret: 'thisshouldbeabettersecret!'  // 암호화에 사용할 비밀키
    }
});

// 세션 스토어에서 오류 발생 시 콘솔에 로그 출력
store.on("error", function (e) {
    console.log("session store error", e);
});

// 세션 설정
const sessionConfig = {
    store,  // 세션 스토어 설정
    name: 'session',  // 쿠키의 이름 설정
    secret: 'thisshouldvbebettersecret',  // 세션 암호화에 사용할 비밀키
    resave: false,  // 세션이 수정되지 않은 경우에도 다시 저장할지 여부
    saveUninitialized: true,  // 초기화되지 않은 세션을 저장할지 여부
    cookie: {
        httpOnly: true,  // 클라이언트에서 쿠키에 접근하지 못하도록 설정
        // secure: true,  // HTTPS에서만 쿠키를 전송하도록 설정 (배포 시 활성화)
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,  // 쿠키의 만료 시간 설정 (7일)
        maxAge: 1000 * 60 * 60 * 24 * 7  // 쿠키의 최대 수명 설정 (7일)
    }
};

// 세션 및 플래시 메시지 미들웨어 사용
app.use(session(sessionConfig));
app.use(flash());

// Helmet을 사용하여 보안 관련 HTTP 헤더 설정
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "https://res.cloudinary.com"],
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "https://maxcdn.bootstrapcdn.com"],
            // 추가적인 CSP 설정을 여기에 추가할 수 있습니다
        },
    })
);

// 추가적인 Content Security Policy (CSP) 설정
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net/npm",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

// Helmet에 CSP 정책 추가
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/",  // 전체 Cloudinary 도메인 허용
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Passport.js 초기화 및 세션 설정
app.use(passport.initialize());
app.use(passport.session());

// 로컬 전략을 사용하여 Passport.js 설정
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 모든 요청에서 플래시 메시지와 현재 사용자를 전역 변수로 설정
app.use((req, res, next) => {
    console.log(req.query);  // 쿼리 문자열을 콘솔에 출력
    res.locals.currentUser = req.user;  // 현재 로그인한 사용자
    res.locals.success = req.flash('success');  // 성공 메시지
    res.locals.error = req.flash('error');  // 에러 메시지
    next();
});

// 임시 라우트: fakeUser 생성
app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'colt@gmail.com', username: 'colt' });
    const newUser = await User.register(user, 'chicken');  // 사용자 등록
    res.send(newUser);  // 생성된 사용자 정보 응답
});

// 라우트 미들웨어 설정
app.use('/', userRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

// 홈 페이지를 렌더링하는 라우트
app.get('/', (req, res) => {
    res.render('home');  // 홈 템플릿을 렌더링하여 응답
});

// 모든 라우트에 대해 404 에러 처리
app.all('*', (req, res, next) => {
    next(new ExpressError('PAGE NOT FOUND', 404));  // 정의되지 않은 경로로 접근 시 커스텀 404 에러 발생
});

// 오류 처리 미들웨어
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;  // 오류 객체에서 상태 코드와 메시지 추출
    res.status(statusCode).render('error', { err });  // 에러 페이지 렌더링
});

// 서버 시작
app.listen(3000, () => {
    console.log('Serving on port 3000');  // 서버가 3000번 포트에서 시작되었다는 메시지 출력
});
