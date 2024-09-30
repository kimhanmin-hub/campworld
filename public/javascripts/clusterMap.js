// Mapbox 접근 토큰을 설정합니다
mapboxgl.accessToken = mapToken; 

// Mapbox 지도를 생성합니다
const map = new mapboxgl.Map({
    container: 'cluster-map',  // 지도를 삽입할 HTML 요소의 ID
    style: 'mapbox://styles/mapbox/light-v11', // 지도 스타일 설정 (Mapbox의 light 테마 사용)
    center: [-103.5917, 40.6699], // 지도의 초기 중심 위치 (경도, 위도)
    zoom: 3 // 지도의 초기 줌 레벨
});

// 내비게이션 컨트롤을 지도에 추가합니다 (줌 인/아웃 버튼 제공)
map.addControl(new mapboxgl.NavigationControl());

map.on('load', () => {
    // GeoJSON 데이터를 소스로 추가하고 클러스터링을 활성화합니다
    map.addSource('campgrounds', {
        type: 'geojson',
        data: campgrounds, // GeoJSON 데이터
        cluster: true, // 클러스터링 활성화
        clusterMaxZoom: 14, // 최대 줌 레벨에서 클러스터링
        clusterRadius: 50 // 클러스터의 반경
    });

    // 클러스터 레이어 추가 (원 형태로 클러스터를 표시)
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'], // 'point_count' 속성이 있는 데이터 필터링
        paint: {
            'circle-color': [
                'step',
                ['get', 'point_count'], // 클러스터에 포함된 포인트 수에 따라 색상 단계 설정
                '#00BCD4', // 포인트 수가 10 미만일 때 색상
                10, '#2196F3', // 포인트 수가 10 이상 30 미만일 때 색상
                30, '#3F51B5' // 포인트 수가 30 이상일 때 색상
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'], // 클러스터에 포함된 포인트 수에 따라 원의 반경 단계 설정
                15, // 포인트 수가 10 미만일 때 반경
                10, 29, // 포인트 수가 10 이상 30 미만일 때 반경
                30, 25 // 포인트 수가 30 이상일 때 반경
            ]
        }
    });

    // 클러스터의 포인트 수를 표시하는 레이어 추가
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'], // 'point_count' 속성이 있는 데이터 필터링
        layout: {
            'text-field': ['get', 'point_count_abbreviated'], // 클러스터의 포인트 수를 약어 형태로 표시
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], // 텍스트 폰트 설정
            'text-size': 12 // 텍스트 크기 설정
        }
    });

    // 클러스터가 아닌 개별 포인트를 표시하는 레이어 추가
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']], // 'point_count' 속성이 없는 데이터 필터링
        paint: {
            'circle-color': '#11b4da', // 포인트의 색상
            'circle-radius': 4, // 포인트의 반경
            'circle-stroke-width': 1, // 포인트의 테두리 두께
            'circle-stroke-color': '#fff' // 포인트의 테두리 색상
        }
    });

    // 클러스터를 클릭할 때, 클러스터를 확장하는 줌 효과 추가
    map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('campgrounds').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    });

    // 개별 포인트를 클릭할 때, 팝업을 표시합니다
    map.on('click', 'unclustered-point', (e) => {
        const { popUpMarkup } = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates.slice();

        // 지도 줌 레벨이 너무 낮아서 여러 포인트가 보일 때, 클릭한 포인트가 보이도록 좌표 조정
        if (['mercator', 'equirectangular'].includes(map.getProjection().name)) {
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(popUpMarkup) // 팝업의 HTML 내용 설정
            .addTo(map); // 팝업을 지도에 추가
    });

    // 클러스터 위로 마우스를 올릴 때 커서를 포인터로 변경
    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // 클러스터 위에서 마우스를 이동할 때 커서를 기본으로 변경
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });
});
