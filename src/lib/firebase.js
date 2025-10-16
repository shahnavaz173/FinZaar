// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYmNddILN6-Zy_5uvyu_aHX0UMidWs_cA",
  authDomain: "fin-zaar.firebaseapp.com",
  projectId: "fin-zaar",
  storageBucket: "fin-zaar.firebasestorage.app",
  messagingSenderId: "295221975101",
  appId: "1:295221975101:web:28e57beb279efa3f58f254",
  measurementId: "G-VFQVVS4CBM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth  = getAuth(app)

export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

