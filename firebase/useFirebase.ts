import {initializeApp, getApps, getApp, FirebaseApp} from 'firebase/app'
import {getFirestore, Firestore, connectFirestoreEmulator} from 'firebase/firestore'
import {getAuth, Auth, connectAuthEmulator} from 'firebase/auth'
import {getStorage, FirebaseStorage, connectStorageEmulator} from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'local',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'languages-164bd',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'project-end-8b7aa.appspot.com',
}

const emulatorHost = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || '127.0.0.1'
const firestorePort = Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || 8081)
const authPort = Number(import.meta.env.VITE_AUTH_EMULATOR_PORT || 9099)
const storagePort = Number(import.meta.env.VITE_STORAGE_EMULATOR_PORT || 9199)

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

export const db: Firestore = getFirestore(app)
export const auth: Auth = getAuth(app)
export const storage: FirebaseStorage = getStorage(app)

declare global {
  interface Window {
    __firebaseEmulatorsConnected?: boolean
  }
}

if (import.meta.env.DEV && !window.__firebaseEmulatorsConnected) {
  try {
    connectFirestoreEmulator(db, emulatorHost, firestorePort)
    connectAuthEmulator(auth, `http://${emulatorHost}:${authPort}`, {
      disableWarnings: true,
    })
    connectStorageEmulator(storage, emulatorHost, storagePort)

    window.__firebaseEmulatorsConnected = true
    console.log(
      `Firebase emulators connected: firestore=${emulatorHost}:${firestorePort}, auth=${emulatorHost}:${authPort}, storage=${emulatorHost}:${storagePort}`
    )
  } catch (error) {
    console.warn('Emulator already connected (HMR):', error)
  }
}

export const useFirebase = () => ({db, auth, storage, firebaseConfig})
