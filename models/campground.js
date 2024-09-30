const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

// 이미지 스키마 정의
const ImageSchema = new Schema({
    url: String,          // 이미지 URL
    filename: String      // 이미지 파일 이름
});

// 이미지 스키마에 'thumbnail' 가상 속성 추가
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');  // 썸네일 이미지 URL 생성
});

// 가상 속성을 JSON 및 객체 변환 시 포함시키기 위한 옵션 설정
const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };

// 캠프그라운드 스키마 정의
const CampgroundSchema = new Schema({
    title: {
        type: String,           // 캠프그라운드 제목
        required: true          // 제목 필수
    },
    images: [ImageSchema],       // 이미지 배열, ImageSchema 사용
    geometry: {
        type: {
            type: String,        // 위치 타입, 'Point'로 제한
            enum: ['Point'],     // 위치 타입의 허용 값
            required: true       // 타입 필수
        },
        coordinates: {
            type: [Number],      // 위치 좌표, [경도, 위도] 형식
            required: true       // 좌표 필수
        }
    },
    price: {
        type: Number,            // 캠프그라운드 가격
        required: true           // 가격 필수
    },
    description: String,         // 캠프그라운드 설명
    location: String,            // 캠프그라운드 위치
    author: {
        type: Schema.Types.ObjectId,  // 작성자 ID
        ref: 'User'                   // User 모델과 참조 설정
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,  // 리뷰 ID
            ref: 'Review'                  // Review 모델과 참조 설정
        }
    ]
}, opts);

// 캠프그라운드의 'popUpMarkup' 가상 속성 정의
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
            <p>${this.description.substring(0, 40)}...</p>`;  // 캠프그라운드 링크와 설명의 일부를 포함한 마크업
});

// 캠프그라운드가 삭제된 후 관련 리뷰도 삭제하는 후크
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        try {
            // 삭제된 캠프그라운드와 관련된 모든 리뷰 삭제
            await Review.deleteMany({
                _id: {
                    $in: doc.reviews  // 삭제된 캠프그라운드의 리뷰 ID 목록
                }
            });
        } catch (error) {
            console.error('Error deleting reviews after campground deletion', error);
        }
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);
