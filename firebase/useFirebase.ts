import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getStorage, FirebaseStorage, connectStorageEmulator } from "firebase/storage";

// ─── Firebase Config ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "local",
  projectId: "languages-164bd",
  storageBucket: "project-end-8b7aa.appspot.com",
};

// ─── Singleton: prevent re-init on Vite HMR ──────────────────────────────────
const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// ─── Services ─────────────────────────────────────────────────────────────────
export const db:      Firestore       = getFirestore(app);
export const auth:    Auth            = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

// ─── Emulator Connection ──────────────────────────────────────────────────────
// ✅ ใช้ window flag เพื่อกัน connect ซ้ำตอน Vite HMR reload
declare global {
  interface Window {
    __firebaseEmulatorsConnected?: boolean;
  }
}

if (import.meta.env.DEV && !window.__firebaseEmulatorsConnected) {
  try {
    connectFirestoreEmulator(db,    "127.0.0.1", 8081);
    connectAuthEmulator(auth,       "http://127.0.0.1:9099", { disableWarnings: true });
    connectStorageEmulator(storage, "127.0.0.1", 9199);

    window.__firebaseEmulatorsConnected = true;
    console.log("✅ Firebase Emulators Connected");
  } catch (e) {
    // Already connected on HMR — safe to ignore
    console.warn("⚠️ Emulator already connected (HMR):", e);
  }
}

// ─── Export hook style (backward compat) ─────────────────────────────────────
export const useFirebase = () => ({ db, auth, storage, firebaseConfig });