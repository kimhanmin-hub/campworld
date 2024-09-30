(function () {
    'use strict'

    // Bootstrap의 커스텀 파일 입력 기능 초기화
    bsCustomFileInput.init()

    // 커스텀 부트스트랩 유효성 검사를 적용할 폼 요소들을 선택
    const forms = document.querySelectorAll('.validated-form')  // `.validated-form` 클래스를 가진 모든 폼 요소를 선택

    // 각 폼 요소에 대해 반복 처리
    Array.from(forms)  // NodeList를 배열로 변환
        .forEach(function (form) {
            // 각 폼에 대해 'submit' 이벤트 리스너를 추가
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {  // 폼이 유효한지 검사
                    event.preventDefault()  // 유효하지 않을 경우 폼 제출을 방지
                    event.stopPropagation()  // 이벤트의 전파를 멈춤
                }

                // 폼에 'was-validated' 클래스를 추가하여 부트스트랩 유효성 검사 스타일을 적용
                form.classList.add('was-validated')  
            }, false)  // 이벤트 버블링을 사용하지 않음
        })
})()
