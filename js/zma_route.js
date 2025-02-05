ZMALoader.setOnLoad(function (mapOptions, error) {
    if (error) {
        console.error(error);
        return;
    }

    const mapElement = document.getElementById('ZMap');

    // 地図の初期設定
//    mapOptions.center = new ZDC.LatLng(35.681406, 139.767132); // 東京駅
//    mapOptions.center = new ZDC.LatLng(35.637085839175484, 139.6707547792902); //日本大学認定こども園
    mapOptions.center = new ZDC.LatLng(35.633385088380514, 139.65796597840765); //駒沢小学校
    mapOptions.zoom = 15;
    mapOptions.mouseWheelReverseZoom = true; // ★マウスホイールのズーム方向の反転を指定


    const map = new ZDC.Map(mapElement, mapOptions, function() {
        // 地図生成成功時の処理

        // コントロールを追加
        map.addControl(new ZDC.ZoomButton('top-left'));
        map.addControl(new ZDC.Compass('top-right'));
        map.addControl(new ZDC.ScaleBar('bottom-left'));

        const start = new ZDC.LatLng(35.64718448457993, 139.6238227792696);//千歳船橋駅
        const end = new ZDC.LatLng(35.633385088380514, 139.65796597840765); //駒沢小学校

//        const start = new ZDC.LatLng(35.637085839175484, 139.6707547792902); //日本大学認定こども園
//        const end = new ZDC.LatLng(35.63448502797939, 139.66985552394794); //青葉学園野沢こども園

        const startMarker = new ZDC.Marker(start);
        const endMarker = new ZDC.Marker(end);
        map.addWidget(startMarker);
        map.addWidget(endMarker);

        const routeUrl = `https://test-web.zmaps-api.com/route/route_mbn/drive_ptp?search_type=1&from=${start.lng},${start.lat}&to=${end.lng},${end.lat}&regulation_type=121200&toll_type=large`;
//        const routeUrl = `https://test-web.zmaps-api.com/route/route_mbn/drive_ptp?search_type=1&from=${start.lng},${start.lat}&to=${end.lng},${end.lat}`;

        fetch(routeUrl, {
            method: 'GET',
            headers: {
                'x-api-key': 'gkZZ5thvD128fdg5OFYGa4nhJCctGemb9FKvZWx3',
                'Authorization': 'referer'
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'OK' && data.result?.item?.length > 0) {
                const routeItem = data.result.item[0];
                const links = routeItem.route?.link;

                if (Array.isArray(links) && links.length > 0) {
                    const decodedPath = [];
                    links.forEach(link => {
                        if (Array.isArray(link.line.coordinates)) {
                            link.line.coordinates.forEach(coord => {
                                if (Array.isArray(coord) && coord.length === 2) {
                                    decodedPath.push(new ZDC.LatLng(coord[1], coord[0]));
                                }
                            });
                        }
                    });

                    console.log("デコードされた座標:", decodedPath);

                    if (decodedPath.length > 0) {
                        const routeLine = new ZDC.Polyline(
                            decodedPath,
                            {
                                color: '#008dcb',
                                width: 5,
                                opacity: 0.7
                            }
                        );
                        map.addWidget(routeLine);
                    } else {
                        console.error("デコードされたルートデータが空です。");
                    }
                } else {
                    console.error("リンクデータが存在しません。");
                }
            } else {
                console.error("ルート検索に失敗しました。レスポンス:", data);
            }
        })
        .catch(error => console.error('ルート検索エラー:', error));
    }, function() {
        console.error('地図の生成に失敗しました');
    });
});
