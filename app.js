if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}


console.log(process.env.SECRET)
console.log(process.env.API_KEY)

const express = require('express');  // Express 모듈을 가져와서 서버 애플리케이션 생성
const path = require('path');  // 파일 및 디렉토리 경로를 다루기 위한 Path 모듈
const mongoose = require('mongoose');  // MongoDB와 상호작용하기 위한 Mongoose 모듈
const ejsMate = require('ejs-mate');  // EJS 템플릿 엔진을 사용하기 위한 레이아웃 패키지
const session = require('express-session');
const flash= require('connect-flash');
const ExpressError = require('./seeds/utils/expressError');  // 커스텀 에러 처리를 위한 클래스
const methodOverride = require('method-override');  // HTML 폼에서 PUT, DELETE 등의 HTTP 메소드를 사용할 수 있게 하는 패키지
const passport = require('passport');
const LocalStrategy = require( 'passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes= require('./routes/reviews');
const MongoStore = require('connect-mongo');

//const dbUrl = process.env.DB_URL;

const dburl = 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dburl, {
    useNewUrlParser: true,  // 새로운 URL 파서 사용
    useUnifiedTopology: true,  // 새로운 서버 발견 및 모니터링 엔진 사용
  
});

const db = mongoose.connection;  // 데이터베이스 연결 상태를 변수에 저장
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
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize({
    replaceWith:'_'
}))

const store = MongoStore.create({
    mongoUrl: dburl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on("error",function(e){
    console.log("session store error",e)
})

const sessionConfig ={
    store,
    name:'session',
    secret:'thisshouldvbebettersecret',
    resave: false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        // secure:true,
        expires:Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }

}
app.use(session(sessionConfig));
app.use(flash());
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

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
   console.log(req.query);
   res.locals.currentUser = req.user;
   res.locals.success= req.flash('success');
   res.locals.error=req.flash('error');
   next();
})

app.get('/fakeUser', async(req,res)=>{
    const user = new User({email:'colt@gmail.com',username:'colt'})
    const newUser = await User.register(user,'chicken');
    res.send(newUser);
})
app.use('/', userRoutes);
app.use('/campgrounds',campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)

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