const mongoose = require('mongoose');  // Mongoose 모듈 가져오기
const cities = require('./cities');  // 도시 데이터 가져오기
const { places, descriptors } = require('./seedHelpers');  // 랜덤 제목 생성을 위한 헬퍼 데이터 가져오기
const Campground = require('../models/campground');  // 캠프장 모델 가져오기

// MongoDB 데이터베이스에 연결
mongoose.connect('mongodb://localhost:27017/yelp-camp')
  .then(() => {
    console.log("Database connected");  // 연결 성공 메시지 출력
  })
  .catch(error => {
    console.error("Connection error:", error);  // 연결 오류 메시지 출력
  });

const db = mongoose.connection;

// 데이터베이스 연결 오류 처리
db.on("error", console.error.bind(console, "connection error:"));

// 데이터베이스 연결 성공 시 메시지 출력
db.once("open", () => {
    console.log("Database connected");
});

// 주어진 배열에서 랜덤한 요소를 반환하는 함수
const sample = array => array[Math.floor(Math.random() * array.length)];

// 데이터베이스를 초기화하는 함수
const seedDB = async () => {   
    await Campground.deleteMany({});  // 기존 캠프장 데이터를 모두 삭제

    // 300개의 캠프장 데이터 생성
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);  // 0에서 999 사이의 랜덤 숫자 생성
        const price = Math.floor(Math.random() * 20) + 10;  // 10에서 30 사이의 랜덤 가격 생성

        const camp = new Campground({
            // 캠프장 작성자 ID (현재는 하드코딩된 예제 ID 사용)
            author: '66cd6002ad1e73e87451e337',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,  // 랜덤 도시와 주 정보
            title: `${sample(descriptors)} ${sample(places)}`,  // 랜덤 제목 생성
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,  // 랜덤 가격
            geometry: {
                type: "Point",  // 좌표 타입
                coordinates: [
                  cities[random1000].longitude,  // 랜덤 경도
                  cities[random1000].latitude,  // 랜덤 위도
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png',  // 캠프장 이미지 URL
                    filename: 'YelpCamp/ahfnenvca4tha00h2ubt'  // 이미지 파일명
                },
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png',  // 캠프장 이미지 URL
                    filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi'  // 이미지 파일명
                }
            ]
        });

        await camp.save();  // 캠프장 데이터 저장
    }
}

// 데이터베이스 초기화 실행 후 연결 종료
seedDB().then(() => {
    mongoose.connection.close();  // 데이터베이스 연결 종료
});
