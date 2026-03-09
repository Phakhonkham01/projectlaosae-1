import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: "local",
  projectId: "languages-164bd", 
  storageBucket: "project-end-8b7aa.appspot.com",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// ✅ ใช้ flag ธรรมดาป้องกัน connect ซ้ำ
let emulatorsConnected = false;

if (import.meta.dev && !emulatorsConnected) {
  emulatorsConnected = true;
  connectFirestoreEmulator(db, "127.0.0.1", 8081);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  console.log("✅ Firebase Emulators Connected");
}

export const useFirebase = () => ({ db, auth, storage, firebaseConfig });