// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCJ52apOU_t67SyJSzturV_5XjW_PooI20",
  authDomain: "run-plan-tracking.firebaseapp.com",
  projectId: "run-plan-tracking",
  storageBucket: "run-plan-tracking.firebasestorage.app",
  messagingSenderId: "675367788387",
  appId: "1:675367788387:web:6d52a22db9d674b3bbbd56",
  measurementId: "G-6XQ9LY2Y64"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const realtimeDb = getDatabase(app);

