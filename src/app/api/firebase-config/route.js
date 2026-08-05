import { NextResponse } from "next/server";

// Serves the Firebase web config + VAPID key to the service worker
// (public/firebase-messaging-sw.js can't read build-time env vars).
export const runtime = "nodejs";

export async function GET() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  return NextResponse.json({
    firebaseConfig,
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  });
}
