// src/features/tracking/useRecentRuns.js
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase"; // chỗ khởi tạo Firestore
import { useAuth } from "../../auth/AuthProvider"; // hook lấy user hiện tại

export function useRecentRuns() {
  const { user } = useAuth();
  const [distances, setDistances] = useState([]);

  useEffect(() => {
    if (!user) return;

    async function fetchRuns() {
      const runsRef = collection(db, "users", user.uid, "runs");
      const q = query(runsRef, orderBy("date", "desc"), limit(5));
      const snapshot = await getDocs(q);
      const kmList = snapshot.docs.map(doc => doc.data().distanceKm || 0);
      setDistances(kmList);
    }

    fetchRuns();
  }, [user]);

  return distances;
}
