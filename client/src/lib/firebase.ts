import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser
} from "firebase/auth";
import { 
  getDatabase, 
  ref, 
  set, 
  onValue, 
  push, 
  get, 
  query, 
  orderByChild,
  serverTimestamp,
  update,
  connectDatabaseEmulator
} from "firebase/database";
import { 
  getStorage, 
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration with direct values from user config
const firebaseConfig = {
  apiKey: "AIzaSyDFckKbku4PHboTpRyxrS47fVDE6Nu3x9w",
  authDomain: "cyber-chat-tamilselvan.firebaseapp.com",
  databaseURL: "https://cyber-chat-tamilselvan-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cyber-chat-tamilselvan",
  storageBucket: "cyber-chat-tamilselvan.firebasestorage.app",
  messagingSenderId: "907806055838",
  appId: "1:907806055838:web:e4a293b5186d33b4178a8f",
  measurementId: "G-4LQZB9Y778"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { 
  app, 
  auth, 
  db, 
  storage,
  analytics,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  ref,
  set,
  onValue,
  push,
  get,
  query,
  orderByChild,
  serverTimestamp,
  update,
  storageRef,
  uploadBytes,
  getDownloadURL
};

export type { FirebaseUser };
