
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// --- KONFIGURASI FIREBASE ANDA ---
// Ganti nilai di bawah ini dengan konfigurasi dari Firebase Console Anda
// (Project Settings -> General -> Your Apps -> Web App)
const firebaseConfig = {
 apiKey: "AIzaSyDGIjYvtM3XcOfeg2XifiCNj1J6bb36Yr0",
  authDomain: "absensi-digital-27a35.firebaseapp.com",
  projectId: "absensi-digital-27a35",
  storageBucket: "absensi-digital-27a35.firebasestorage.app",
  messagingSenderId: "238256358552",
  appId: "1:238256358552:web:7ce5e3db7f1265cec57ced",
  measurementId: "G-9PRWC0WMD7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper function to check if config is set
export const isFirebaseConfigured = () => {
  // Return true jika API Key bukan string kosong dan bukan placeholder default
  return firebaseConfig.apiKey !== "" && firebaseConfig.apiKey !== "ISI_API_KEY_DISINI";
};
