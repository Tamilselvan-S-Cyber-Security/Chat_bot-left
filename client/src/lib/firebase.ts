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

// Use environment variables for Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // Derive other values from projectId
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  databaseURL: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.asia-southeast1.firebasedatabase.app`,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);

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
