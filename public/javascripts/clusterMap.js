// TO MAKE THE MAP APPEAR YOU MUST
	// ADD YOUR ACCESS TOKEN FROM



	// https://account.mapbox.com
	mapboxgl.accessToken = mapToken;//
    //이 코드는 EJS(Embedded JavaScript Templates) 템플릿 엔진을 사용하여 서버 측에서 환경 변수를 클라이언트 측으로 전달하기 위해 사용됩니다. 이 방법을 사용하면, 서버에서 설정된 MAPBOX_TOKEN 환경 변수를 클라이언트 측 JavaScript 코드로 안전하게 전달할 수 있습니다. 이렇게 하는 이유는 다음과 같습니다:
//보안 측면: 클라이언트 측에서 직접 토큰을 하드코딩하지 않음으로써 보안이 향상됩니다. 서버 측에서만 환경 변수를 저장하고, 클라이언트는 템플릿을 렌더링할 때 이를 전달받습니다.
// 동적 할당: 서버에서 템플릿을 렌더링할 때, 현재 설정된 환경 변수 값을 동적으로 HTML에 삽입할 수 있습니다.
    const map = new mapboxgl.Map({
        container: 'cluster-map',
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-103.5917, 40.6699],
        zoom: 3
    });

    map.addControl(new mapboxgl.NavigationControl());

    

    map.on('load', () => {
        
        // Add a new source from our GeoJSON data and
        // set the 'cluster' option to true. GL-JS will
        // add the point_count property to your source data.
        map.addSource('campgrounds', {
            type: 'geojson',
            // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
            // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
            data: campgrounds,
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });

        map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'campgrounds',
            filter: ['has', 'point_count'],
            paint: {
                // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
                // with three steps to implement three types of circles:
                //   * Blue, 20px circles when point count is less than 100
                //   * Yellow, 30px circles when point count is between 100 and 750
                //   * Pink, 40px circles when point count is greater than or equal to 750
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    '#00BCD4',
                    10,
                    '#2196F3',
                    30,
                    '#3F51B5'
                ],
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    15,
                    10,
                    29,
                    30,
                    25
                ]
            }
        });

        map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'campgrounds',
            filter: ['has', 'point_count'],
            layout: {
                'text-field':  ['get', 'point_count_abbreviated'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            }
        });

        map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'campgrounds',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': '#11b4da',
                'circle-radius': 4,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff'
            }
        });

        // inspect a cluster on click
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

        // When a click event occurs on a feature in
        // the unclustered-point layer, open a popup at
        // the location of the feature, with
        // description HTML from its properties.
        map.on('click', 'unclustered-point', (e) => {
            const {popUpMarkup} = e.features[0].properties;
            const coordinates = e.features[0].geometry.coordinates.slice();
          

            // Ensure that if the map is zoomed out such that
            // multiple copies of the feature are visible, the
            // popup appears over the copy being pointed to.
            if (['mercator', 'equirectangular'].includes(map.getProjection().name)) {
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(popUpMarkup)               
                .addTo(map);
        });

        map.on('mouseenter', 'clusters', () => {
            
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', () => {
            map.getCanvas().style.cursor = '';
        });
    });

   