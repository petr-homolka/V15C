import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Konfigurace Firebase (pro pilotní sandbox verze).
// Pokud nejsou k dispozici klíče z proměnných prostředí, použijí se výchozí sandbox hodnoty.
const firebaseConfig = {
  apiKey: import.meta?.env?.VITE_FIREBASE_API_KEY || "sandbox-api-key-placeholder",
  authDomain: import.meta?.env?.VITE_FIREBASE_AUTH_DOMAIN || "doprovazeni-sandbox.firebaseapp.com",
  projectId: import.meta?.env?.VITE_FIREBASE_PROJECT_ID || "doprovazeni-sandbox",
  storageBucket: import.meta?.env?.VITE_FIREBASE_STORAGE_BUCKET || "doprovazeni-sandbox.appspot.com",
  messagingSenderId: import.meta?.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta?.env?.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000"
};

// Inicializace Firebase App
export const app = initializeApp(firebaseConfig);

// Inicializace Firebase Auth
export const auth = getAuth(app);

// Inicializace Firestore
export const db = getFirestore(app);
