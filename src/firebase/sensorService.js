import { realtimeDb } from './firebaseConfig';
import { ref, set, onValue } from "firebase/database";

// Gửi dữ liệu sensor (ví dụ từ mobile app giả lập)
export function sendSensorData(userId, data) {
  const sensorRef = ref(realtimeDb, 'sensors/' + userId);
  return set(sensorRef, {
    timestamp: Date.now(),
    acceleration: data.accel,
    gps: data.gps,
    speed: data.speed
  });
}

// Lắng nghe dữ liệu sensor realtime (từ mobile gửi về)
export function listenSensorData(userId, callback) {
  const sensorRef = ref(realtimeDb, 'sensors/' + userId);
  onValue(sensorRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
}
