import { doc, setDoc, getDoc } from "firebase/firestore";
import { firestore } from './firebaseConfig';

// Tạo hồ sơ người dùng mới khi đăng ký
export async function createUserProfile(userId, {email}) {
  const safeUserId = email.replace(/[@.]/g, "_");
  const userRef = doc(firestore, "users", userId);
  await setDoc(userRef, {
    email,
    safeUserId,
    bmi: null,
    currentPlan: [],
    totalKM: 0,
    milestones: [],
    createdAt: Date.now()
  });
}

// Lấy hồ sơ người dùng khi cần (ví dụ để render dashboard)
export async function getUserProfile(userId) {
  const userRef = doc(firestore, "users", userId);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() ? docSnap.data() : null;
}
