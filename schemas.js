// BaseJoi 모듈을 가져옵니다. Joi는 데이터 유효성 검사를 위한 JavaScript 라이브러리입니다.
const BaseJoi = require('joi');

// sanitize-html 모듈을 가져옵니다. 이 모듈은 HTML 입력을 정리(즉, 허용되지 않는 HTML 태그와 속성을 제거)합니다.
const sanitizeHtml = require('sanitize-html');

// Joi에 확장(extension)을 정의합니다. 이 확장은 string 타입에 대해 HTML을 제거하는 커스텀 검증 규칙을 추가합니다.
const extension = (joi) => ({
  type: 'string', // 확장은 'string' 타입에 적용됩니다.
  base: joi.string(), // 확장의 기본 타입은 Joi의 기본 string 타입입니다.
  messages: {
    // 사용자 정의 에러 메시지를 정의합니다. 'string.escapeHTML' 규칙이 실패할 때 이 메시지가 사용됩니다.
    'string.escapeHTML': '{{#label}} must not include HTML!' // #label은 에러가 발생한 필드명을 의미합니다.
  },
  rules: {
    escapeHTML: {
      // escapeHTML이라는 커스텀 규칙을 정의합니다.
      validate(value, helpers) {
        // sanitizeHtml을 사용하여 입력된 문자열에서 모든 HTML 태그와 속성을 제거합니다.
        const clean = sanitizeHtml(value, {
          allowedTags: [], // 허용되는 태그를 비워 모든 태그를 제거합니다.
          allowedAttributes: {}, // 허용되는 속성을 비워 모든 속성을 제거합니다.
        });

        // 만약 clean된 결과가 원래 값과 다르다면(즉, HTML 태그나 속성이 제거되었다면) 에러를 발생시킵니다.
        if (clean !== value) return helpers.error('string.escapeHTML', { value });

        // 값이 안전하다면 clean된 값을 반환합니다.
        return clean;
      }
    }
  }
});

// 커스텀 확장을 추가한 Joi 객체를 생성합니다. 이 확장을 통해 HTML이 포함되지 않은 문자열 검증을 수행할 수 있습니다.
const Joi = BaseJoi.extend(extension);

// campgroundSchema라는 스키마를 모듈로 내보냅니다.
// 이 스키마는 캠프장(campground) 데이터의 유효성을 검사하는 데 사용됩니다.
module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(), // title 필드는 필수이며, HTML을 포함할 수 없습니다.
    price: Joi.number().required().min(0), // price 필드는 필수이며, 0 이상의 숫자여야 합니다.
    // image: Joi.string().required(), // 주석 처리된 부분: 이미지 필드가 요구되었으나 현재는 비활성화 상태입니다.
    location: Joi.string().required().escapeHTML(), // location 필드는 필수이며, HTML을 포함할 수 없습니다.
    description: Joi.string().required().escapeHTML() // description 필드는 필수이며, HTML을 포함할 수 없습니다.
  }).required(), // campground 객체 자체도 필수입니다.
  deleteImages: Joi.array() // deleteImages는 배열이어야 하며, 필수는 아닙니다.
});

// reviewSchema라는 스키마를 모듈로 내보냅니다.
// 이 스키마는 리뷰(review) 데이터의 유효성을 검사하는 데 사용됩니다.
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5), // rating 필드는 필수이며, 1 이상 5 이하의 숫자여야 합니다.
    body: Joi.string().required().escapeHTML() // body 필드는 필수이며, HTML을 포함할 수 없습니다.
  }).required() // review 객체 자체도 필수입니다.
});
