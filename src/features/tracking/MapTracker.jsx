import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect, useState, useMemo } from 'react';
import { saveRunPath, getTodayPlan } from "../../firebase/trackService";
import { calculateTotalDistance } from "../utils/geoUtils";
import TodayInfo from "../component/TodayInfo";
import { listenSensorData } from "../../firebase/sensorService";
import useAuthListener from "../../hooks/useAuthListener"; // Import hook to get current user
import { getUserProfile } from "../../firebase/userService"; // Import to fetch safeUserId
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix leaflet's default icon path issues with Vite/Webpack/Vercel
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function UpdateMapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function MapTracker() {
  const { user } = useAuthListener(); // Get the logged-in user
  const [positions, setPositions] = useState([]);
  const [tracking, setTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [useSensorData, setUseSensorData] = useState(false); // Toggle for data source
  const [safeUserId, setSafeUserId] = useState(null); // Store safeUserId
  const [targetDistance, setTargetDistance] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  useEffect(() => {
    if (useSensorData && user?.uid) {
      // Fetch safeUserId when switching to sensor data
      getUserProfile(user.uid).then((profile) => {
        if (profile?.safeUserId) {
          setSafeUserId(profile.safeUserId);
        } else {
          alert("SafeUserId not found for this user.");
        }
      });
    }
  }, [useSensorData, user?.uid]);

  const startTracking = () => {
    if (useSensorData) {
      if (!safeUserId) {
        alert("SafeUserId is required to use sensor data.");
        return;
      }

      // Listen to sensor data
      const unsubscribe = listenSensorData(safeUserId, (data) => {
        console.log("Sensor data received:", data); // Debugging log
        if (data?.gps?.lat != null && data?.gps?.lng != null) {
          setPositions((prev) => {
            const newPositions = [...prev, [parseFloat(data.gps.lat), parseFloat(data.gps.lng)]];
            console.log("Updated positions:", newPositions); // Debugging log
            return newPositions;
          });
        } else {
          console.warn("Invalid sensor data:", data); // Debugging log
        }
      });

      setWatchId(() => unsubscribe); // Store unsubscribe function
    } else {
      if (!navigator.geolocation) {
        alert("Trình duyệt không hỗ trợ GPS");
        return;
      }

      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log("GPS data received:", { latitude, longitude }); // Debugging log
          setPositions((prev) => [...prev, [latitude, longitude]]);
        },
        (err) => console.error("GPS error:", err),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
      setWatchId(id);
    }

    // Start timer
    const now = Date.now();
    setStartTime(now);
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - now);
    }, 1000);
    setTimerInterval(interval);
    setPositions([]); // Reset previous path
    setTracking(true);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      if (useSensorData && typeof watchId === "function") {
        watchId(); // Call unsubscribe function for sensor data
      } else {
        navigator.geolocation.clearWatch(watchId);
      }
      setWatchId(null);
    }

    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    if (positions.length > 1 && user?.uid) {
      saveRunPath(user.uid, positions, totalDistance)
        .then(() => alert("Đã lưu đường chạy"))
        .catch((err) => console.error("Lỗi lưu đường chạy:", err));
    }

    setTracking(false);
  };

  const totalDistance = useMemo(() => calculateTotalDistance(positions), [positions]); // km
  const caloriesBurned = useMemo(() => totalDistance * 60, [totalDistance]); // 60 kcal/km ước lượng
  const progressPercent = useMemo(() => {
    return targetDistance > 0 ? Math.min((totalDistance / targetDistance) * 100, 100) : 0;
  }, [totalDistance, targetDistance]);

  const currentPos = useMemo(() => {
    if (positions.length > 0) {
      return positions[positions.length - 1]; // Use the last position if available
    }
    return [21.0285, 105.8542]; // Default to Hà Nội if no positions yet
  }, [positions]);

  // Format elapsed time as mm:ss
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (user?.uid) {
      getTodayPlan(user.uid).then((plan) => {
        if (plan?.targetDistance) {
          setTargetDistance(Number(plan.targetDistance));
        }
      });
    }
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [user?.uid]);

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <TodayInfo userId={user?.uid} setTargetDistance={setTargetDistance} />

        {!tracking ? (
          <button onClick={startTracking} className="px-4 py-2 bg-green-600 text-white rounded">Bắt đầu chạy</button>
        ) : (
          <button onClick={stopTracking} className="px-4 py-2 bg-red-600 text-white rounded">Kết thúc chạy</button>
        )}

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={useSensorData}
            onChange={(e) => setUseSensorData(e.target.checked)}
          />
          Sử dụng dữ liệu cảm biến
        </label>
      </div>

      {currentPos && ( // Render the map only when a valid position is available
        <>
          <div className="bg-indigo-800 text-white p-4 rounded-lg shadow-md mb-4 text-center">
            <div className="text-sm">Thời gian chạy: </div><div className="text-3xl font-bold">{formatTime(elapsedTime)}</div>
          </div>
          <div style={{ height: '400px', width: '100%' }} className="mb-4">
            <MapContainer center={currentPos} zoom={18} style={{ height: "400px", width: "100%" }}>
              <UpdateMapCenter center={currentPos} />
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
            <p><strong>Vận tốc trung bình:</strong> {elapsedTime > 0 ? (totalDistance / (elapsedTime / 3600000)).toFixed(2) : "0.00"} km/h</p>
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

