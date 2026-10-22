"use client";

import { initializeApp, getApps } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

// Firebase config — values come from .env.local
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app = null;
let messagingPromise = null;
let lastFailure = null;

// Last reason messaging failed to initialize (surfaced in the UI so the
// generic "unsupported" message can be replaced with something actionable).
export function getFirebaseFailureReason() {
    return lastFailure;
}

// Async capability snapshot used by the in-app diagnostics: Firebase's own
// isSupported() plus the IndexedDB write test it performs internally.
export async function getFirebaseSupportStatus() {
    let firebaseIsSupported = null;
    let firebaseError = null;
    try {
        firebaseIsSupported = await isSupported();
    } catch (e) {
        firebaseError = `${e?.name || "error"}: ${e?.message || e}`;
    }

    let indexedDBWrite = "unavailable";
    if (typeof indexedDB !== "undefined") {
        indexedDBWrite = await new Promise((resolve) => {
            let settled = false;
            const done = (v) => {
                if (!settled) {
                    settled = true;
                    resolve(v);
                }
            };
            try {
                const req = indexedDB.open("velvet-support-check");
                req.onsuccess = () => {
                    try {
                        req.result.close();
                        indexedDB.deleteDatabase("velvet-support-check");
                    } catch (e) {}
                    done("ok");
                };
                req.onerror = () => done(`error: ${req.error?.message || "unknown"}`);
                req.onblocked = () => done("blocked");
                setTimeout(() => done("timeout"), 3000);
            } catch (e) {
                done(`exception: ${e?.message || e}`);
            }
        });
    }

    return {
        firebaseIsSupported,
        firebaseError,
        indexedDBWrite,
        report: getPushSupportReport(),
        failure: lastFailure,
    };
}

// Mirrors the checks Firebase's isSupported() performs, so we can report
// exactly which browser capability is missing instead of guessing.
export function getPushSupportReport() {
    if (typeof window === "undefined") {
        return { supported: false, failed: ["not-in-browser"] };
    }
    const failed = [];
    const check = (name, ok) => {
        if (!ok) failed.push(name);
    };
    check("cookies-disabled", !!navigator.cookieEnabled);
    check("service-worker", "serviceWorker" in navigator);
    check("push-manager", typeof window.PushManager !== "undefined");
    check("notification-api", typeof window.Notification !== "undefined");
    check("fetch", "fetch" in window);
    check(
        "show-notification",
        typeof window.ServiceWorkerRegistration !== "undefined" &&
            "showNotification" in ServiceWorkerRegistration.prototype
    );
    check(
        "push-get-key",
        typeof window.PushSubscription !== "undefined" &&
            "getKey" in PushSubscription.prototype
    );
    check("indexeddb", typeof indexedDB !== "undefined");
    check(
        "firebase-config",
        !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId)
    );
    return { supported: failed.length === 0, failed };
}

// Client-only init, safe against SSR.
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

async function initMessaging() {
    // isSupported() opens a throwaway IndexedDB database, so it can fail
    // transiently. Retry once before declaring the browser unsupported.
    let supported = false;
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            supported = await isSupported();
        } catch (e) {
            supported = false;
        }
        if (supported) break;
        if (attempt === 0) await new Promise((r) => setTimeout(r, 400));
    }

    if (!supported) {
        const report = getPushSupportReport();
        lastFailure = report.failed.length
            ? `browser check failed: ${report.failed.join(", ")}`
            : "Firebase isSupported() returned false";
        return null;
    }

    const fbApp = getFirebaseApp();
    if (!fbApp) {
        lastFailure = "Firebase config missing from build (NEXT_PUBLIC_FIREBASE_*)";
        return null;
    }

    try {
        const instance = getMessaging(fbApp);
        lastFailure = null;
        return instance;
    } catch (e) {
        lastFailure = `${e?.code || e?.name || "error"}: ${e?.message || e}`;
        return null;
    }
}

// Returns a promise (kept memoized so concurrent callers don't each run the
// IndexedDB support probe). A failed initialization is retried on next call.
export function getFirebaseMessaging() {
    if (typeof window === "undefined") return Promise.resolve(null);
    if (!messagingPromise) {
        messagingPromise = initMessaging()
            .catch((e) => {
                lastFailure = `${e?.code || e?.name || "error"}: ${e?.message || e}`;
                return null;
            })
            .then((instance) => {
                if (!instance) messagingPromise = null;
                return instance;
            });
    }
    return messagingPromise;
}

export { firebaseConfig };
