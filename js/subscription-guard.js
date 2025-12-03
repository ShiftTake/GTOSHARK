// -------------------------------------------------------
// GTO SHARK • Subscription Gatekeeper for Paid Pages
// -------------------------------------------------------
import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// ----------------------------------------------
// MAP OF PAGE → REQUIRED SUBSCRIPTION TIER
// ----------------------------------------------
const REQUIRED_TIER = {
  "blackjacktrainer.html": "blackjack",
  "baccarattrainer198.html": "baccarat",
  "roulette.html": "roulette",
  "pokerdashboard.html": "poker",
  "pokerhandreview.html": "poker",
  "chartsolver.html": "poker",
  "gtopractice.html": "poker"
};


// ----------------------------------------------
// LIST OF ALWAYS-FREE PAGES
// ----------------------------------------------
const DEMO_PAGES = [
  "blackjacktrainerdemo.html",
  "bactrainerdemo.html",
  "roulettetrainerdemo.html",
  "pokerpreflopsolverdemo.html"
];


// ----------------------------------------------
// SUBSCRIPTION CHECK LOGIC
// ----------------------------------------------
function hasAccess(required, userTier, isAdmin) {
  if (isAdmin) return true;

  if (DEMO_PAGES.includes(window.location.pathname.split("/").pop())) {
    return true;
  }

  if (userTier === "free trial") return true;

  if (!required) return true;

  if (userTier === "All Game Bundle") return true;

  return userTier === required;
}


// ----------------------------------------------
// AUTH WATCHER
// ----------------------------------------------
onAuthStateChanged(auth, async (user) => {
  const page = window.location.pathname.split("/").pop();

  // Demo pages are always free
  if (DEMO_PAGES.includes(page)) return;

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    window.location.href = "upgrade.html";
    return;
  }

  const userData = snap.data();

  const requiredTier = REQUIRED_TIER[page];
  const userTier = userData.subscriptionTier;
  const isAdmin = userData.role === "admin";

  if (!hasAccess(requiredTier, userTier, isAdmin)) {
    window.location.href = "upgrade.html";
  }
});
