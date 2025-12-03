// -------------------------------------------------
// GTO SHARK • Authentication + Free Trial Engine
// -------------------------------------------------
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// -------------------------------
//  CREATE NEW USER + FREE TRIAL
// -------------------------------
export async function signupUser(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // Create Firestore profile for new user
  await setDoc(doc(db, "users", cred.user.uid), {
    email: email,
    subscriptionTier: "free trial",
    status: "active",
    startedAt: serverTimestamp(),
    isAdmin: false
  });

  return cred.user;
}


// -------------------------------
//  LOGIN USER
// -------------------------------
export async function loginUser(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}


// -------------------------------
//  LOGOUT USER
// -------------------------------
export async function logoutUser() {
  return await signOut(auth);
}


// ---------------------------------------------
//  FREE TRIAL CHECK • EXPIRES AFTER 5 DAYS
// ---------------------------------------------
async function checkFreeTrial(user, userDoc) {
  if (userDoc.subscriptionTier !== "free trial") return;

  const started = userDoc.startedAt.toDate();
  const now = new Date();

  const diffDays = Math.floor((now - started) / (1000 * 60 * 60 * 24));

  if (diffDays >= 5) {
    // Expire trial
    await updateDoc(doc(db, "users", user.uid), {
      subscriptionTier: "none",
      status: "expired"
    });

    window.location.href = "upgrade.html";
  }
}


// ---------------------------------------------
//  AUTH STATE LISTENER (GLOBAL APP CONTROLLER)
// ---------------------------------------------
onAuthStateChanged(auth, async (user) => {
  window.currentUser = user;

  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) return;

  const userData = snap.data();

  // Run free trial expiration check
  if (userData.subscriptionTier === "free trial") {
    checkFreeTrial(user, userData);
  }

  // Expose userData globally
  window.userData = userData;
});


// ---------------------------------------------
//  PASSWORD RESET
// ---------------------------------------------
export async function resetPassword(email) {
  return await sendPasswordResetEmail(auth, email);
}
