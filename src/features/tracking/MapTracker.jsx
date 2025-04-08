import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { useEffect, useState, useMemo } from 'react';
import { saveRunPath, getTodayPlan } from "../../firebase/trackService";
import { calculateTotalDistance } from "../utils/geoUtils";
import TodayInfo from "../component/TodayInfo";


export default function MapTracker({ userId }) {
  const [positions, setPositions] = useState([]);
  const [tracking, setTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [targetDistance, setTargetDistance] = useState(0);

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ GPS");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPositions(prev => [...prev, [latitude, longitude]]);
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );

    setWatchId(id);
    setPositions([]); // reset đường cũ
    setTracking(true);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    if (positions.length > 1 && userId) {
      saveRunPath(userId, positions)
        .then(() => alert("Đã lưu đường chạy"))
        .catch(err => console.error("Lỗi lưu đường chạy:", err));
    }

    setTracking(false);
  };

  const totalDistance = useMemo(() => calculateTotalDistance(positions), [positions]); // km
  const caloriesBurned = useMemo(() => totalDistance * 60, [totalDistance]); // 60 kcal/km ước lượng
  const progressPercent = useMemo(() => {
    return targetDistance > 0 ? Math.min((totalDistance / targetDistance) * 100, 100) : 0;
  }, [totalDistance, targetDistance]);

  const currentPos = positions[positions.length - 1] || [21.0285, 105.8542]; // fallback: Hà Nội

  useEffect(() => {
    if (userId) {
      getTodayPlan(userId).then(plan => {
        if (plan?.targetDistance) {
          setTargetDistance(Number(plan.targetDistance));
        }
      });
    }
  }, [userId]);

  return (
    <div>
      <div className="flex gap-2 mb-3">
      <TodayInfo userId={userId} setTargetDistance={setTargetDistance} />

        {!tracking ? (
          <button onClick={startTracking} className="px-4 py-2 bg-green-600 text-white rounded">Bắt đầu chạy</button>
        ) : (
          <button onClick={stopTracking} className="px-4 py-2 bg-red-600 text-white rounded">Kết thúc chạy</button>
        )}
      </div>

      {positions.length > 0 && (
        <>
          <div style={{ height: '400px', width: '100%' }} className="mb-4">
          <MapContainer center={currentPos} zoom={18} style={{ height: "400px", width: "100%" }}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {positions.length > 0 && (
    <>
      <Polyline positions={positions} color="blue" />
      <Marker position={currentPos}>
        <Popup>Vị trí hiện tại</Popup>
      </Marker>
    </>
  )}
</MapContainer>
          </div>

          <div className="text-sm bg-gray-100 p-3 rounded shadow">
            <p><strong>Quãng đường:</strong> {totalDistance.toFixed(2)} km</p>
            <p><strong>Năng lượng tiêu thụ:</strong> {caloriesBurned.toFixed(0)} kcal</p>

            {targetDistance >= 0 && (
              <div className="mt-2">
                <p><strong>Chỉ tiêu hôm nay:</strong> {targetDistance} km</p>
                <p><strong>Tiến độ:</strong> {progressPercent.toFixed(0)}%</p>
                {progressPercent >= 100 ? (
                  <p className="text-green-600 font-semibold">🎉 Hoàn thành chỉ tiêu!</p>
                ) : (
                  <p className="text-yellow-600">🏃‍♂️ Còn {(targetDistance - totalDistance).toFixed(2)} km nữa</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

