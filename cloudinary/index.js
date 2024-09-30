const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary의 환경 설정을 구성합니다.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // Cloudinary의 클라우드 이름
    api_key: process.env.CLOUDINARY_KEY,            // Cloudinary API 키
    api_secret: process.env.CLOUDINARY_SECRET        // Cloudinary API 비밀 키
});

// CloudinaryStorage 설정을 정의합니다.
// Multer를 사용하여 업로드된 파일을 Cloudinary에 저장하는 데 사용됩니다.
const storage = new CloudinaryStorage({
    cloudinary,  // 설정할 Cloudinary 인스턴스
    params: {
        folder: 'YelpCamp',  // Cloudinary에서 저장할 폴더 이름
        allowedFormats: ['jpeg', 'png', 'jpg']  // 허용되는 파일 형식
    }
});

// Cloudinary 인스턴스와 설정된 저장소를 모듈로 내보냅니다.
module.exports = {
    cloudinary,
    storage
}
