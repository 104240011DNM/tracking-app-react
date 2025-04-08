import { auth, firestore } from './firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Đăng ký người dùng mới
export async function registerUser(email, password, extraInfo = {}) {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    // Lưu thêm info vào Firestore
    await setDoc(doc(firestore, 'users', user.uid), {
      email,
      createdAt: Date.now(),
      ...extraInfo
    });

    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}

// Đăng nhập
export async function loginUser(email, password) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    return userCred.user;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}

// Đăng xuất
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out user:', error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}
