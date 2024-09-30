// Error 클래스를 확장하여 커스텀 에러 클래스를 정의
class ExpressError extends Error {
    // 생성자 함수, 에러 메시지와 상태 코드를 매개변수로 받음
    constructor(message, statusCode) {
        super();  // 부모 클래스인 Error의 생성자를 호출하여 기본 에러 속성을 설정

        this.message = message;  // 에러 메시지 설정
        this.statusCode = statusCode;  // 에러 상태 코드 설정

        // Stack trace를 생성하여 에러가 발생한 위치를 추적할 수 있도록 함
        // Error의 기본 생성자가 this.stack을 설정합니다.
    }
}

// ExpressError 클래스를 다른 모듈에서 사용할 수 있도록 내보냄
module.exports = ExpressError;
