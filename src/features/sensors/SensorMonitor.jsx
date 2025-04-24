import React, { useEffect, useState } from "react";
import { listenSensorData } from "../../firebase/sensorService";
import { getUserProfile } from "../../firebase/userService";

export default function SensorMonitor({ userId }) {
  const [sensorData, setSensorData] = useState(null);
  const [safeUserId, setSafeUserId] = useState(null);

  useEffect(() => {
    if (!userId) return;

    // 🔍 Lấy safeUserId từ Firestore
    getUserProfile(userId).then(profile => {
      if (profile?.safeUserId) setSafeUserId(profile.safeUserId);
    });
  }, [userId]);

  useEffect(() => {
    if (!safeUserId) return;

    let lastTimestamp = null;
    let currentSpeed = 0;

    // 👂 Lắng nghe sensor data từ realtime DB
    const unsubscribe = listenSensorData(safeUserId, (data) => {
      const normalized = {
        timestamp: data.timestamp,
        acceleration: data.acceleration ?? {
          x: data.x ?? null,
          y: data.y ?? null,
          z: data.z ?? null
        },
        gps: data.gps ?? {
          lat: data.lat ?? null,
          lng: data.lng ?? null
        }
      };

      // Calculate speed using linear acceleration
      if (normalized.acceleration && lastTimestamp) {
        const deltaTime = (normalized.timestamp - lastTimestamp) / 1000; // Convert ms to seconds
        const linearAcceleration = Math.sqrt(
          Math.pow(normalized.acceleration.x ?? 0, 2) +
          Math.pow(normalized.acceleration.y ?? 0, 2) +
          Math.pow(normalized.acceleration.z ?? 0, 2)
        )*0.1;

        currentSpeed = linearAcceleration * deltaTime; // Integrate acceleration to calculate speed
        currentSpeed = Math.max(0, currentSpeed); // Ensure speed is non-negative
      }

      lastTimestamp = normalized.timestamp;

      setSensorData({
        ...normalized,
        speed: currentSpeed.toFixed(2) // Add calculated speed
      });
    });

    return () => unsubscribe && unsubscribe();
  }, [safeUserId]);

  if (!sensorData) {
    return (
      <div className="p-4 border rounded bg-white shadow">
        <h3 className="text-lg font-semibold mb-2">📡 Sensor Realtime</h3>
        <p className="text-gray-500">⏳ Đang chờ dữ liệu từ cảm biến...</p>
      </div>
    );
  }

  const { gps, acceleration, speed, timestamp } = sensorData;

  return (
    <div className="p-4 border rounded shadow-md space-y-2 bg-white text-gray-800">
      <h3 className="text-lg font-bold mb-2">📡 Dữ liệu cảm biến (real-time)</h3>

      <div className="text-sm space-y-1">
        <p><strong>🧑‍💻 Safe User ID:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded">{safeUserId}</code></p>
        <p><strong>🕒 Thời gian:</strong> {new Date(timestamp).toLocaleString()}</p>
        <p><strong>🚀 Tốc độ:</strong> {speed ?? "N/A"} m/s</p>

        <div>
          <p className="font-semibold">📍 Vị trí GPS:</p>
          <ul className="ml-4 list-disc">
            <li>Latitude: {gps?.lat ?? "N/A"}</li>
            <li>Longitude: {gps?.lng ?? "N/A"}</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold">📈 Gia tốc:</p>
          <ul className="ml-4 list-disc">
            <li>X: {acceleration?.x ?? "N/A"}</li>
            <li>Y: {acceleration?.y ?? "N/A"}</li>
            <li>Z: {acceleration?.z ?? "N/A"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
