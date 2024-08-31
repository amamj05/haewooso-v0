import React, { useEffect, useState, useRef } from "react";
import Detail from "../components/Detail";
import axios from "axios";

function Map({ userLocation }) {
  const [restrooms, setRestrooms] = useState([]);
  const [map, setMap] = useState(null);
  const [selectedRestroom, setSelectedRestroom] = useState(null); // 선택된 화장실 정보 저장
  const [showDetail, setShowDetail] = useState(false); // Detail을 보여줄지 여부
  const ref = useRef(null);

  // 사용자의 위치를 기반으로 공중화장실 데이터를 가져오는 함수
  const fetchRestrooms = async (lat, lng) => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/nearby-restrooms/",
        {
          params: {
            lat: lat,
            lng: lng,
            radius: 1000, // 1km 반경 내 공중화장실을 검색
          },
        }
      );
      setRestrooms(response.data.items || []);
    } catch (error) {
      console.error("Error fetching restroom data:", error);
    }
  };

  useEffect(() => {
    const initMap = () => {
      const initialMap = new window.naver.maps.Map("map", {
        center: new window.naver.maps.LatLng(37.566535, 126.9779692),
        zoom: 15,
      });
      setMap(initialMap);
    };

    initMap();
  }, []);

  // 초기 공중화장실 데이터를 가져오기
  useEffect(() => {
    fetchRestrooms(37.566535, 126.9779692);
  }, []);

  useEffect(() => {
    if (map && restrooms.length > 0) {
      restrooms.forEach(restroom => {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(
            restroom.latitude,
            restroom.longitude
          ),
          map: map,
          title: restroom.name,
        });

        window.naver.maps.Event.addListener(marker, "click", function () {
          console.log("Selected Restroom:", restroom); // 여기서 restroom 객체를 출력하여 확인
          setSelectedRestroom(restroom); // 선택된 화장실 정보를 설정
          setShowDetail(true); // Detail을 보여주도록 설정
        });
      });
    }
  }, [map, restrooms]);

  useEffect(() => {
    if (map && userLocation) {
      // 사용자 위치에 파란색 점 표시
      new window.naver.maps.Circle({
        map: map,
        center: userLocation,
        radius: 20, // 원의 반지름 (미터 단위)
        fillColor: "blue",
        fillOpacity: 0.8,
        strokeColor: "#000",
        strokeWeight: 2,
      });

      // 지도를 사용자 위치로 이동
      map.setCenter(userLocation);
      map.setZoom(15);

      // 사용자 위치를 기반으로 공중화장실 데이터 다시 가져오기
      fetchRestrooms(userLocation.lat(), userLocation.lng());
    }
  }, [map, userLocation]);

  useEffect(() => {
    const detailHandle = event => {
      if (ref.current && !ref.current.contains(event.target)) {
        setShowDetail(false); // 외부 클릭 시 Detail을 닫음
      }
    };
    document.addEventListener("mousedown", detailHandle);
    return () => {
      document.removeEventListener("mousedown", detailHandle);
    };
  }, []);

  return (
    <div className="map-container">
      <div ref={ref}>
        {selectedRestroom && (
          <Detail
            restroom={selectedRestroom}
            className={
              showDetail ? "detail-container show" : "detail-container"
            }
          />
        )}
      </div>
      <div
        id="map"
        style={{
          width: "100%",
          height: "calc(100vh - 37px)",
          marginTop: "0px",
        }}
      />
    </div>
  );
}

export default Map;
