// Hàm tính khoảng cách giữa 2 tọa độ GPS (haversine)
export function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = angle => (angle * Math.PI) / 180;
    const R = 6371; // Earth radius in km
  
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c; // in km
  }
  
  export function calculateTotalDistance(coords) {
    if (coords.length < 2) return 0;
  
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      const [lat1, lon1] = coords[i - 1];
      const [lat2, lon2] = coords[i];
      total += haversineDistance(lat1, lon1, lat2, lon2);
    }
    return total;
  }
    