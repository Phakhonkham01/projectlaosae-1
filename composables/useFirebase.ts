// ~/composables/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyByIIQgYDSIUG8ukysCfhT8FNdkFZqFhHM",
  authDomain: "project-end-8b7aa.firebaseapp.com",
  projectId: "project-end-8b7aa",
  storageBucket: "project-end-8b7aa.appspot.com",
  messagingSenderId: "343668282595",
  appId: "1:343668282595:web:039e542350b42c2530e1d6",
  measurementId: "G-819G3XDTPT",
};

// Initialize Firebase app
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export const useFirebase = () => ({ db, auth, storage, firebaseConfig });
