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
  update
} from "firebase/database";
import { 
  getStorage, 
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

// Basic Firebase configuration to get started
const firebaseConfig = {
  apiKey: "AIzaSyDFckKbku4PHboTpRyxrS47fVDE6Nu3x9w",
  authDomain: "cyber-chat-tamilselvan.firebaseapp.com",
  databaseURL: "https://cyber-chat-tamilselvan-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cyber-chat-tamilselvan",
  storageBucket: "cyber-chat-tamilselvan.appspot.com",
  appId: "1:907806055838:web:e4a293b5186d33b4178a8f"
};

// Initialize Firebase services - using a singleton pattern to avoid duplicate initialization
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // Handle cases where the app is already initialized
  console.warn("Firebase app already initialized", error);
  app = initializeApp(firebaseConfig, "secondary");
}

const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { 
  app, 
  auth, 
  db, 
  storage,
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
