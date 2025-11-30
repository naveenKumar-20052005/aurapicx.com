// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';

// // --- PASTE KEYS HERE ONCE ---
// const firebaseConfig = {
// apiKey: "AIzaSyB1LCk9suowZ1abeDg_EPg1juf9Ah-Vqg4",
//   authDomain: "aura-pic.firebaseapp.com",
//   projectId: "aura-pic",
//   storageBucket: "aura-pic.firebasestorage.app",
//   messagingSenderId: "897744047516",
//   appId: "1:897744047516:web:bcaadc2da18e3f49628c59",
//   measurementId: "G-Y22P3EB4Z1"
// };

// const app = initializeApp(Object.keys(firebaseConfig).length ? firebaseConfig : { apiKey: "demo" });
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const DB_COLLECTION = "aura_images";



































// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';

// // --- PASTE YOUR FIREBASE CONFIG HERE ---
// const firebaseConfig = {
//   apiKey: "AIzaSyB1LCk9suowZ1abeDg_EPg1juf9Ah-Vqg4",
//   authDomain: "aura-pic.firebaseapp.com",
//   projectId: "aura-pic",
//   storageBucket: "aura-pic.firebasestorage.app",
//   messagingSenderId: "897744047516",
//   appId: "1:897744047516:web:bcaadc2da18e3f49628c59",
//   measurementId: "G-Y22P3EB4Z1"
// };

// const app = initializeApp(Object.keys(firebaseConfig).length > 1 ? firebaseConfig : { apiKey: "demo" });
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const DB_COLLECTION = "aura_images";










import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// --- PASTE YOUR FIREBASE CONFIG HERE ---
const firebaseConfig = {
    apiKey: "AIzaSyB1LCk9suowZ1abeDg_EPg1juf9Ah-Vqg4",
  authDomain: "aura-pic.firebaseapp.com",
  projectId: "aura-pic",
  storageBucket: "aura-pic.firebasestorage.app",
  messagingSenderId: "897744047516",
  appId: "1:897744047516:web:bcaadc2da18e3f49628c59",
  measurementId: "G-Y22P3EB4Z1"

};

const app = initializeApp(Object.keys(firebaseConfig).length > 1 ? firebaseConfig : { apiKey: "demo" });

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const DB_COLLECTION = "aura_images";