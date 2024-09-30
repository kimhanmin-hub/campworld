const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 리뷰 스키마 정의
const reviewSchema = new Schema({
    body: {
        type: String,        // 리뷰 본문을 저장하는 필드
        required: true       // 본문 필드는 필수
    },
    rating: {
        type: Number,        // 리뷰 평점을 저장하는 필드
        required: true,      // 평점 필드는 필수
        min: 1,              // 평점은 최소 1
        max: 5               // 평점은 최대 5
    },
    author: {
        type: Schema.Types.ObjectId, // 작성자의 ID를 저장하는 필드
        ref: 'User',                // 'User' 모델과 참조 설정
        required: true              // 작성자 필드는 필수
    }
});

// Review 모델을 정의하고 내보냅니다
module.exports = mongoose.model('Review', reviewSchema);
