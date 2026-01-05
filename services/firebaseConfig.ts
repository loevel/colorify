import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace with your actual Firebase Configuration object
// You can find this in your Firebase Console -> Project Settings -> General -> "Your apps"
const firebaseConfig = {
  apiKey: "AIzaSyBv_j6K6d589pRf6UdOwY6JmFLZsZQhmSI",
  authDomain: "colorcraft-app-2026.firebaseapp.com",
  projectId: "colorcraft-app-2026",
  storageBucket: "colorcraft-app-2026.firebasestorage.app",
  messagingSenderId: "660629698580",
  appId: "1:660629698580:web:e8a46f5d45db1355114f01"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);