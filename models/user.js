const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

// 사용자 스키마 정의
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,  // 이메일 필드 필수
        unique: true     // 이메일 필드의 값은 고유해야 함
    }
});

// Passport-Local-Mongoose 플러그인 추가
UserSchema.plugin(passportLocalMongoose);

// User 모델을 정의하고 내보냅니다
module.exports = mongoose.model('User', UserSchema);
