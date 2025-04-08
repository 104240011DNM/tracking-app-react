import { realtimeDb } from "./firebaseConfig";
import { ref, push } from "firebase/database";
import { firestore } from "./firebaseConfig";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

// Lưu 1 lần chạy
export function saveRunPath(userId, path) {
  const runRef = ref(realtimeDb, `runs/${userId}`);
  return push(runRef, {
    path,
    createdAt: Date.now(),
  });
}

// Lấy kế hoạch hôm nay
export async function getTodayPlan(userId) {
  try {
    const today = new Date().toISOString().split("T")[0];

    const q = query(
      collection(firestore, "plans"), // Đảm bảo trùng tên collection khi lưu
      where("userId", "==", userId),
      where("date", "==", today),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const planDoc = querySnapshot.docs[0];
      return { id: planDoc.id, ...planDoc.data() };
    } else {
      return null;
    }
  } catch (err) {
    console.error("Lỗi khi lấy kế hoạch hôm nay:", err);
    return null;
  }
}
