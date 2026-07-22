import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBd-rME4hNCFTsNAnO8xBrH2BM6kJO8c0E",
  authDomain: "habitflow-76f7a.firebaseapp.com",
  projectId: "habitflow-76f7a",
  storageBucket: "habitflow-76f7a.firebasestorage.app",
  messagingSenderId: "247033506896",
  appId: "1:247033506896:web:eddcddece480068e983555"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);