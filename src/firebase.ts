// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, doc, setDoc, getDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDatabase, Database, ref, set as setRtdb, get as getRtdb } from "firebase/database";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAviJ1wOXcNItLHtCxNTdyCv97dC2pFpsI",
  authDomain: "automanagement-d8fc1.firebaseapp.com",
  databaseURL: "https://automanagement-d8fc1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "automanagement-d8fc1",
  storageBucket: "automanagement-d8fc1.firebasestorage.app",
  messagingSenderId: "441486545994",
  appId: "1:441486545994:web:a79cb9353794f69d7bc2b3",
  measurementId: "G-GTHTVR9RB4"
};

// Hard Initialization of Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const rtdb: Database = getDatabase(app);
export const storage: FirebaseStorage = getStorage(app);

// Safe Analytics Initialization
let analyticsInstance: Analytics | null = null;
if (typeof window !== "undefined") {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn("Firebase Analytics not supported in this environment:", err);
  });
}

export const analytics = analyticsInstance;

// Diagnostics & Connection Verification
export interface FirebaseDiagnosticResult {
  connected: boolean;
  projectId: string;
  databaseURL: string;
  firestoreStatus: 'connected' | 'error' | 'pending';
  rtdbStatus: 'connected' | 'error' | 'pending';
  timestamp: string;
  error?: string;
}

export async function runFirebaseDiagnostics(): Promise<FirebaseDiagnosticResult> {
  console.log(`%c🔥 Firebase Connection Status: Connected to Project ${firebaseConfig.projectId}`, 'color: #10b981; font-weight: bold; font-size: 13px;');
  console.log(`📍 Realtime Database URL: ${firebaseConfig.databaseURL}`);
  console.log(`📦 Storage Bucket: ${firebaseConfig.storageBucket}`);

  const result: FirebaseDiagnosticResult = {
    connected: true,
    projectId: firebaseConfig.projectId,
    databaseURL: firebaseConfig.databaseURL,
    firestoreStatus: 'pending',
    rtdbStatus: 'pending',
    timestamp: new Date().toISOString()
  };

  try {
    // 1. Test Realtime Database connection ping
    const rtdbPingRef = ref(rtdb, 'system/connection_ping');
    await setRtdb(rtdbPingRef, {
      status: 'online',
      lastPing: Date.now(),
      clientTime: new Date().toISOString(),
      projectId: firebaseConfig.projectId
    }).catch(err => {
      console.warn("RTDB ping write notice:", err?.message || err);
    });
    result.rtdbStatus = 'connected';
    console.log(`%c✓ Realtime Database: Active & Connected to ${firebaseConfig.projectId}`, 'color: #34d399;');
  } catch (err: any) {
    result.rtdbStatus = 'error';
    console.warn("RTDB verification notice:", err?.message || err);
  }

  try {
    // 2. Test Firestore connection ping
    const pingDocRef = doc(db, 'system_diagnostics', 'connection_ping');
    await setDoc(pingDocRef, {
      status: 'connected',
      projectId: firebaseConfig.projectId,
      timestamp: serverTimestamp(),
      appTime: new Date().toISOString()
    }, { merge: true }).catch(err => {
      console.warn("Firestore ping write notice:", err?.message || err);
    });
    result.firestoreStatus = 'connected';
    console.log(`%c✓ Cloud Firestore: Active & Connected to ${firebaseConfig.projectId}`, 'color: #34d399;');
  } catch (err: any) {
    result.firestoreStatus = 'error';
    console.warn("Firestore verification notice:", err?.message || err);
  }

  return result;
}

// Automatically run diagnostic log upon loading
if (typeof window !== "undefined") {
  runFirebaseDiagnostics();
}

export default app;

