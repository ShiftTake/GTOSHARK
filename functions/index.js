// ===============================
// GTO SHARK – STRIPE WEBHOOK SYNC
// ===============================
// Node.js 18 Firebase Cloud Function
// ===============================

import Stripe from "stripe";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();
const db = admin.firestore();

// ------------------------------
// STRIPE SETUP
// ------------------------------
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Webhook secret from Stripe Dashboard
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;


// ------------------------------
// PRICE → SUBSCRIPTION TIER MAP
// Replace these with REAL Stripe Price IDs
// ------------------------------
const PRICE_TO_TIER = {
  // "price_12345": "poker",
  // "price_xxxxx": "blackjack",
  // "price_xxxxx": "baccarat",
  // "price_xxxxx": "roulette",
  // "price_xxxxx": "all"
};


// ------------------------------
// MAIN WEBHOOK
// ------------------------------
export const handleStripeWebhook = functions
  .region("us-central1")
  .https.onRequest(async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        endpointSecret
      );
    } catch (err) {
      console.error("❌ Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ===============================
    // HANDLE STRIPE EVENTS
    // ===============================

    switch (event.type) {

      // -----------------------------------------
      // SUBSCRIPTION CREATED or UPDATED
      // -----------------------------------------
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;

        const customerId = subscription.customer;
        const priceId = subscription.items.data[0].price.id;

        const tier = PRICE_TO_TIER[priceId] || "inactive";

        console.log("🔄 Subscription update:", {
          customerId,
          priceId,
          tier
        });

        // Get user UID from metadata (important!)
        const uid = subscription.metadata.uid;
        if (!uid) {
          console.error("❌ Missing UID in subscription metadata");
          return res.status(200).send("ok");
        }

        // Update Firestore
        await db.collection("users").doc(uid).update({
          subscriptionTier: tier,
          startedAt: admin.firestore.Timestamp.now(),
          expiration: admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000)
        });

        console.log(`✅ Updated user ${uid} to tier: ${tier}`);

        break;
      }

      // -----------------------------------------
      // SUBSCRIPTION CANCELED
      // -----------------------------------------
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const uid = subscription.metadata.uid;

        if (!uid) return res.status(200).send("ok");

        await db.collection("users").doc(uid).update({
          subscriptionTier: "inactive"
        });

        console.log(`🚫 Subscription canceled for user ${uid}`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.status(200).send("ok");
  });