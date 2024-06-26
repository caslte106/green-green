	// 사이트 접속했을 때, 새로고침했을 때 사용자 접속 위치로 지도에 표시 
    
    
 	// 사용자의 현재 위치를 가져와서 꽃집을 검색하고 지도에 표시하는 함수
     function searchNearbyFlowerShops() {
        // 사용자의 현재 위치를 가져옵니다.
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude; // 사용자의 현재 위도
            var lng = position.coords.longitude; // 사용자의 현재 경도

            // 사용자의 현재 위치를 지도의 중심으로 설정합니다.
            var center = new kakao.maps.LatLng(lat, lng);
            map.setCenter(center);

            // 근처의 꽃집을 검색합니다.
            var ps = new kakao.maps.services.Places();
            ps.keywordSearch('꽃집', function(data, status, pagination) {
                if (status === kakao.maps.services.Status.OK) {
                    // 검색 결과를 지도에 표시합니다.
                    displayPlaces(data);
                } else {
                    alert('검색 결과가 없습니다.');
                }
            }, {
                location: center, // 검색을 수행할 중심 위치를 설정합니다.
                radius: 2000 // 중심 위치로부터의 반경을 설정합니다. 여기서는 2km로 설정합니다.
            });
        }, function(error) {
            // 위치 정보를 가져오는 데 실패한 경우 처리할 코드를 여기에 추가할 수 있습니다.
            console.error('현재 위치를 가져오는 데 실패했습니다.', error);
     //       alert('현재 위치를 가져오는 데 실패했습니다.');
        });
    }
    // 검색 결과를 지도에 표시하는 함수입니다.
    function displayPlaces(places) {
        var bounds = new kakao.maps.LatLngBounds();

        for (var i = 0; i < places.length; i++) {
            // 마커를 생성하고 지도에 표시합니다.
            var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x);
            var marker = new kakao.maps.Marker({
                position: placePosition
            });
            marker.setMap(map);

            // 검색된 장소들의 위치를 합쳐서 지도의 경계를 설정합니다.
            bounds.extend(placePosition);
        }

        // 검색된 장소들이 모두 보이도록 지도의 확대 수준을 조정합니다.
        map.setBounds(bounds);
    }

    // 페이지가 로드될 때 사용자의 현재 위치에서 꽃집을 검색하고 지도에 표시합니다.
    window.onload = searchNearbyFlowerShops;
    
    
    // 지역명 뒤에 자동으로 ' 꽃집'집어넣어서 검색되게 하기
    function searchPlaces() {
        var keywordInput = document.getElementById('keyword');
        var keyword = keywordInput.value.trim(); // 입력된 키워드를 가져옵니다

        // 입력된 키워드가 지역명이라면 '꽃집'을 추가합니다
        if (!keyword.toLowerCase().includes('꽃집')) {
            keyword += ' 꽃집';
        }

        if (!keyword.replace(/^\s+|\s+$/g, '')) {
            alert('키워드를 입력해주세요!');
            return false;
        }

        // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
        ps.keywordSearch(keyword, placesSearchCB); 
    }
    
//-------------------------------------------------------꽃집 리스트 뽑기----------------------------------------------------------
    

// 검색 결과를 담을 변수
var searchResults = [];

// '대전 꽃집'을 검색하는 함수
function searchDaejeonFlowerShops() {
    var keyword = '대전 꽃집';
    
    // 장소 검색을 요청합니다.
    ps.keywordSearch(keyword, function(data, status, pagination) {
        if (status === kakao.maps.services.Status.OK) {
            // 검색 결과를 저장합니다
            searchResults = data;

            // 백엔드로 데이터를 보냅니다
            sendSearchResultsToBackend(searchResults);

            // 콘솔에 결과를 출력합니다.
            console.log("searchResults: ", searchResults);
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            alert('검색 결과가 존재하지 않습니다.');
        } else if (status === kakao.maps.services.Status.ERROR) {
            alert('검색 결과 중 오류가 발생했습니다.');
        }
    });
}
	
	// 샵 리스트 JSON 변환
	function sendSearchResultsToBackend(results) {
	    var jsonData = JSON.stringify(results); // 검색 결과를 JSON 문자열로 변환
	
	    var xhr = new XMLHttpRequest();
	    xhr.open("POST", "/shop/shop_map.do", true); // POST 방식으로 shop_map.do 엔드포인트에 요청
	    xhr.setRequestHeader("Content-Type", "application/json");
	
	    xhr.onreadystatechange = function () {
	        if (xhr.readyState === 4) {
	            if (xhr.status === 200) {
					console.log("jsonData" + jsonData);
	                console.log("Search results sent successfully");
	            } else {
	                console.error("Failed to send search results:", xhr.statusText);
	            }
	        }
	    };
	
	/*
	// 백엔드로 검색 결과를 보내는 함수
	function sendSearchResultsToBackend(results) {
		var url = "/shop/shop_map.do/" + results;
	    // 여기에서 AJAX 요청을 만듭니다. 예를 들어 jQuery의 $.ajax를 사용할 수 있습니다.
	    var xhr = new XMLHttpRequest();
	    xhr.open("POST", "YOUR_BACKEND_ENDPOINT", true);
	    xhr.setRequestHeader("Content-Type", "application/json");
	
	    xhr.onreadystatechange = function () {
	        if (xhr.readyState === 4 && xhr.status === 200) {
	            // 요청이 완료되었을 때 실행할 코드
	            console.log("Search results sent successfully");
	        }
	    }; */
	
	    // JSON 형식으로 데이터를 보냅니다
	    xhr.send(JSON.stringify(results));
	    
		// searchResults 배열 안에 있는 각 객체의 속성들을 콘솔에 출력
		/*
		for (var i = 0; i < searchResults.length; i++) {
		    var result = searchResults[i];
		    console.log("Result " + (i + 1) + ":");
		    for (var key in result) {
		        if (result.hasOwnProperty(key)) {
		            console.log(key + ": " + result[key]);
		        }
		    }
		    console.log("------------------------");
		} */
	}
	

/* 	function sendSearchResultsToBackend(results) {
	    $.ajax({
	        url: "YOUR_BACKEND_ENDPOINT",
	        type: "POST",
	        contentType: "application/json",
	        data: JSON.stringify(results),
	        success: function(response) {
	            console.log("Search results sent successfully");
	        },
	        error: function(xhr, status, error) {
	            console.error("Error sending search results:", status, error);
	        }
	    });
	} */
    
	
//----------------------------------------------------------------------------------------------------------------------------
	
	

	
//----------------------------------------------------------------------------------------------------------------------------
    
    
    // 검색 결과 목록과 마커를 표출하는 함수입니다
    function displayPlaces(places) {
    
        var listEl = document.getElementById('placesList'), 
        menuEl = document.getElementById('menu_wrap'),
        fragment = document.createDocumentFragment(), 
        bounds = new kakao.maps.LatLngBounds(), 
        listStr = '';
        
        // 검색 결과 목록에 추가된 항목들을 제거합니다
        removeAllChildNods(listEl);
    
        // 지도에 표시되고 있는 마커를 제거합니다
        removeMarker();
        
        for ( var i=0; i<places.length; i++ ) {
    
            // 마커를 생성하고 지도에 표시합니다
            var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
                marker = addMarker(placePosition, i), 
                itemEl = getListItem(i, places[i]); // 검색 결과 항목 Element를 생성합니다
    
            // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
            // LatLngBounds 객체에 좌표를 추가합니다
            bounds.extend(placePosition);
    
            // 마커와 검색결과 항목에 mouseover 했을때
            // 해당 장소에 인포윈도우에 장소명을 표시합니다
            // mouseout 했을 때는 인포윈도우를 닫습니다
            (function(marker, title) {
                kakao.maps.event.addListener(marker, 'mouseover', function() {
                    displayInfowindow(marker, title);
                });
    
                kakao.maps.event.addListener(marker, 'mouseout', function() {
                    infowindow.close();
                });
    
                itemEl.onmouseover =  function () {
                    displayInfowindow(marker, title);
                };
    
                itemEl.onmouseout =  function () {
                    infowindow.close();
                };
            })(marker, places[i].place_name);
    
            fragment.appendChild(itemEl);
        }
    
        // 검색결과 항목들을 검색결과 목록 Element에 추가합니다
        listEl.appendChild(fragment);
        menuEl.scrollTop = 0;
    
        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        map.setBounds(bounds);
    }
    
    // 검색결과 항목을 Element로 반환하는 함수입니다
    function getListItem(index, places) {
    
        var el = document.createElement('li'),
        itemStr = '<span class="markerbg marker_' + (index+1) + '"></span>' +
                    '<div class="info">' +
                    '   <h5>' + places.place_name + '</h5>';
    
        if (places.road_address_name) {
            itemStr += '    <span>' + places.road_address_name + '</span>' +
                        '   <span class="jibun gray">' +  places.address_name  + '</span>';
        } else {
            itemStr += '    <span>' +  places.address_name  + '</span>'; 
        }
                     
          itemStr += '  <span class="tel">' + places.phone  + '</span>' +
                    '</div>';           
    
        el.innerHTML = itemStr;
        el.className = 'item';
    
        return el;
    }
    
    // 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
    function addMarker(position, idx, title) {
        var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // 마커 이미지 url, 스프라이트 이미지를 씁니다
            imageSize = new kakao.maps.Size(36, 37),  // 마커 이미지의 크기
            imgOptions =  {
                spriteSize : new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
                spriteOrigin : new kakao.maps.Point(0, (idx*46)+10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
                offset: new kakao.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
            },
            markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
                marker = new kakao.maps.Marker({
                position: position, // 마커의 위치
                image: markerImage 
            });
    
        marker.setMap(map); // 지도 위에 마커를 표출합니다
        markers.push(marker);  // 배열에 생성된 마커를 추가합니다
    
        return marker;
    }
    
    // 지도 위에 표시되고 있는 마커를 모두 제거합니다
    function removeMarker() {
        for ( var i = 0; i < markers.length; i++ ) {
            markers[i].setMap(null);
        }   
        markers = [];
    }
    
    // 검색결과 목록 하단에 페이지번호를 표시는 함수입니다
    function displayPagination(pagination) {
        var paginationEl = document.getElementById('pagination'),
            fragment = document.createDocumentFragment(),
            i; 
    
        // 기존에 추가된 페이지번호를 삭제합니다
        while (paginationEl.hasChildNodes()) {
            paginationEl.removeChild (paginationEl.lastChild);
        }
    
        for (i=1; i<=pagination.last; i++) {
            var el = document.createElement('a');
            el.href = "#";
            el.innerHTML = i;
    
            if (i===pagination.current) {
                el.className = 'on';
            } else {
                el.onclick = (function(i) {
                    return function() {
                        pagination.gotoPage(i);
                    }
                })(i);
            }
    
            fragment.appendChild(el);
        }
        paginationEl.appendChild(fragment);
    }
    
    // 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
    // 인포윈도우에 장소명을 표시합니다
    function displayInfowindow(marker, title) {
        var content = '<div style="padding:5px;z-index:1;">' + title + '</div>';
    
        infowindow.setContent(content);
        infowindow.open(map, marker);
    }
    
     // 검색결과 목록의 자식 Element를 제거하는 함수입니다
    function removeAllChildNods(el) {   
        while (el.hasChildNodes()) {
            el.removeChild (el.lastChild);
        }
    }
    
    // 일반지도 위성지도
//일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
var mapTypeControl = new kakao.maps.MapTypeControl();

// 지도 타입 컨트롤을 지도에 표시합니다
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

function getInfo() {
    // 지도의 현재 중심좌표를 얻어옵니다 
    var center = map.getCenter(); 
    
    // 지도의 현재 레벨을 얻어옵니다
    var level = map.getLevel();
    
    // 지도타입을 얻어옵니다
    var mapTypeId = map.getMapTypeId(); 
    
    // 지도의 현재 영역을 얻어옵니다 
    var bounds = map.getBounds();
    
    // 영역의 남서쪽 좌표를 얻어옵니다 
    var swLatLng = bounds.getSouthWest(); 
    
    // 영역의 북동쪽 좌표를 얻어옵니다 
    var neLatLng = bounds.getNorthEast(); 
    
    // 영역정보를 문자열로 얻어옵니다. ((남,서), (북,동)) 형식입니다
    var boundsStr = bounds.toString();
    
    
    var message = '지도 중심좌표는 위도 ' + center.getLat() + ', <br>';
    message += '경도 ' + center.getLng() + ' 이고 <br>';
    message += '지도 레벨은 ' + level + ' 입니다 <br> <br>';
    message += '지도 타입은 ' + mapTypeId + ' 이고 <br> ';
    message += '지도의 남서쪽 좌표는 ' + swLatLng.getLat() + ', ' + swLatLng.getLng() + ' 이고 <br>';
    message += '북동쪽 좌표는 ' + neLatLng.getLat() + ', ' + neLatLng.getLng() + ' 입니다';
    	
}

		// 확대 축소 스크롤
	// 지도에 컨트롤을 추가해야 지도위에 표시됩니다
	// kakao.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
	map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
	
	// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
	var zoomControl = new kakao.maps.ZoomControl();
	map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

//현위치 버튼
//이전에 생성된 현재 위치 마커를 저장할 변수
var currentLocationMarker = null;

// '현위치' 버튼 클릭 시 사용자의 현재 위치로 지도의 중심을 이동하고, 마커와 인포윈도우를 생성하는 함수
function setCurrentLocation() {
    // 사용자의 현재 위치를 가져오는 브라우저 API를 이용합니다.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude; // 사용자의 현재 위도
            var lng = position.coords.longitude; // 사용자의 현재 경도
            
            // 현재 위치를 지도의 중심으로 설정합니다.
            map.setCenter(new kakao.maps.LatLng(lat, lng));

            // 이전에 생성된 마커가 있다면 제거합니다.
            if (currentLocationMarker) {
                currentLocationMarker.setMap(null);
            }

            // 사용자의 현재 위치에 새로운 마커를 생성합니다.
            var markerPosition = new kakao.maps.LatLng(lat, lng);
            currentLocationMarker = new kakao.maps.Marker({
                position: markerPosition
            });
            currentLocationMarker.setMap(map);

            // 인포윈도우에 표시할 내용을 설정합니다.
            var infowindowContent = '<div style="padding:5px 40px;">현재 위치</div>';

            // 인포윈도우를 생성합니다.
            var infowindow = new kakao.maps.InfoWindow({
                content: infowindowContent
            });
            infowindow.open(map, currentLocationMarker);
        }, function(error) {
            // 위치 정보를 가져오는 데 실패한 경우 처리할 코드를 여기에 추가할 수 있습니다.
            console.error('현재 위치를 가져오는 데 실패했습니다.', error);
        });
    } else {
        alert('이 브라우저에서는 현재 위치를 가져올 수 없습니다.');
    }
}

//'현 지도에서 검색' 버튼을 클릭했을 때 호출되는 함수
function searchWithinMapBounds() {
    // 현재 지도 화면의 경계를 가져옵니다.
    var bounds = map.getBounds();

    // 남서쪽과 북동쪽 좌표를 얻어옵니다.
    var swLatLng = bounds.getSouthWest();
    var neLatLng = bounds.getNorthEast();

    // 꽃집과 관련된 키워드로 검색합니다.
    ps.keywordSearch('꽃집', placesSearchCB, {
        bounds: bounds
    });
}

// 지도의 드래그 이동 이벤트를 감지하여 마커들이 14개 이하로 보이면 "현 지도에서 검색" 버튼을 표시하는 함수
kakao.maps.event.addListener(map, 'dragend', function() {
    // 현재 지도 화면의 경계를 가져옵니다.
    var bounds = map.getBounds();
    // 보이는 마커의 개수를 세어봅니다.
    var visibleMarkerCount = countVisibleMarkers(bounds);
    // 보이는 마커의 개수가 14개 이하인 경우에만 "현 지도에서 검색" 버튼을 표시합니다.
    if (visibleMarkerCount <= 14) {
        document.getElementById('searchWithinMap').style.display = 'block';
    } else {
        document.getElementById('searchWithinMap').style.display = 'none';
    }
});

// 지도 화면에 보이는 마커의 개수를 세는 함수
function countVisibleMarkers(bounds) {
    var visibleMarkerCount = 0;
    // 모든 마커의 위치를 가져와서 화면에 보이는지 여부를 확인합니다.
    for (var i = 0; i < markers.length; i++) {
        if (bounds.contain(markers[i].getPosition())) {
            visibleMarkerCount++;
        }
    }
    return visibleMarkerCount;
}



// ------------------------꽃집 리스트-----------------------------



