// --------------------------------------------
// GTO SHARK • Firebase Core Config
// --------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKTzQmFE8nU4qpw8V-R6suAZSIPaMN-bg",
  authDomain: "gto-shark.firebaseapp.com",
  projectId: "gto-shark",
  storageBucket: "gto-shark.firebasestorage.app",
  messagingSenderId: "1093311477198",
  appId: "1:1093311477198:web:ea6cea1cec1f22d2b5679f",
  measurementId: "G-0MZCYY705L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export globally for all modules
export const auth = getAuth(app);
export const db = getFirestore(app);
