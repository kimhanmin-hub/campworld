// Mapbox 접근 토큰 설정
mapboxgl.accessToken = mapToken;

// 새로운 Mapbox 지도를 생성
const map = new mapboxgl.Map({
    container: 'map',  // 지도를 삽입할 HTML 요소의 ID
    style: 'mapbox://styles/mapbox/light-v10', // 지도의 스타일을 설정 (Mapbox의 light 테마 사용)
    center: campground.geometry.coordinates, // 지도의 시작 위치를 경도와 위도로 설정
    zoom: 10 // 지도의 시작 줌 레벨
});

// 지도에 내비게이션 컨트롤 추가 (줌 인/아웃 버튼 제공)
map.addControl(new mapboxgl.NavigationControl());

// 새로운 마커 생성 및 설정
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates) // 마커의 위치를 설정 (경도와 위도)
    .setPopup(  // 마커 클릭 시 나타날 팝업 설정
        new mapboxgl.Popup({ offset: 25 })  // 팝업의 위치 오프셋 설정
            .setHTML(  // 팝업의 HTML 내용 설정
                `<h3>${campground.title}</h3><p>${campground.location}</p>`  // 캠프그라운드 제목과 위치를 표시
            )
    )
    .addTo(map)  // 생성된 마커를 지도에 추가
