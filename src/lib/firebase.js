"use client";

import { initializeApp, getApps } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

// Firebase config — values come from .env.local
// (Fake placeholders until the real Firebase console values are provided)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app = null;
let messaging = null;

// Client-only init, safe against SSR. Returns null when Firebase
// messaging isn't supported (old browsers) or env is missing.
export function getFirebaseApp() {
  if (typeof window === "undefined") return null;
  const hasConfig =
    firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId;
  if (!hasConfig) return null;
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
}

export async function getFirebaseMessaging() {
  if (typeof window === "undefined") return null;
  try {
    const supported = await isSupported();
    if (!supported) return null;
    if (!messaging) {
      const fbApp = getFirebaseApp();
      if (!fbApp) return null;
      messaging = getMessaging(fbApp);
    }
    return messaging;
  } catch (e) {
    console.error("Firebase messaging init failed", e);
    return null;
  }
}

export { firebaseConfig };
