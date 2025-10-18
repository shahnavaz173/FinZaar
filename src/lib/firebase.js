// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDKqHLMA_VvkZf40QE3wUlWaLL15xOTfCo",
  authDomain: "fund-flare.firebaseapp.com",
  projectId: "fund-flare",
  storageBucket: "fund-flare.firebasestorage.app",
  messagingSenderId: "653988636891",
  appId: "1:653988636891:web:2159230faeb895378604fe",
  measurementId: "G-0N978P91SJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth  = getAuth(app)

export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

