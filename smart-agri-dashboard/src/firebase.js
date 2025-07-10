// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHpokYA0QMr8QaWSQFfTuWywksR5q0b7Y",
  authDomain: "smart-agri-76b26.firebaseapp.com",
  databaseURL: "https://smart-agri-76b26-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-agri-76b26",
  storageBucket: "smart-agri-76b26.firebasestorage.app",
  messagingSenderId: "1000331106332",
  appId: "1:1000331106332:web:45334c6b037d436a71e7d9",
  measurementId: "G-11GKMWD0GB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

export { app, analytics, database };

