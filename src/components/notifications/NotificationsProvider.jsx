"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/lib/store";
import {
  getFirebaseMessaging,
  getFirebaseFailureReason,
  getPushSupportReport,
} from "@/lib/firebase";
import { getToken, onMessage, onUnregistered } from "firebase/messaging";
import { registerDeviceToken } from "@/lib/notifications";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const SW_PATH = "/firebase-messaging-sw.js";
// Legacy key (pre multi-user support). Kept so stale entries get cleaned up.
const LEGACY_TOKEN_STORAGE_KEY = "velvet_fcm_token";

// Keyed per user so a second login on the same browser re-registers its own
// token instead of reusing (or skipping) the previous user's.
const getTokenStorageKey = (userId) => `velvet_fcm_token_${userId}`;

// FCM tokens shouldn't be requested until the service worker is active,
// otherwise getToken can fail with a "registration did not exist" error.
// The timeout prevents the UI from hanging forever if the worker never
// activates (e.g. the browser blocked it).
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function requestDeviceToken(messaging) {
  const registration = await withTimeout(
    navigator.serviceWorker.ready,
    15000,
    "service worker activation"
  );
  return getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    // Passing the registration explicitly avoids getToken picking up a stale
    // or out-of-scope worker (e.g. the old firebase-messaging-sw.jsx).
    serviceWorkerRegistration: registration,
  });
}

const NotificationsContext = createContext({
  permission: "default",
  requestFcmPermission: async () =>
    "error:NotificationsProvider is not mounted above this component",
});

export function useNotificationsFcm() {
  return useContext(NotificationsContext);
}

/**
 * Root FCM wiring (mounted once in the layout):
 *  - Registers the service worker on load.
 *  - When the user is authenticated (after rehydration), requests
 *    permission + registers the device token with the backend.
 *  - Listens for foreground messages and shows a toast.
 *  - Exposes requestFcmPermission() so the bell can trigger the
 *    browser permission prompt from a user gesture (Safari requires it).
 */
export function NotificationsProvider({ children }) {
  const queryClient = useQueryClient();
  const locale = useLocale();
  const { isAuthenticated, _hasHydrated, user } = useAuthStore();
  const userId = user?.id ?? null;
  const [permission, setPermission] = useState(
    typeof window !== "undefined" && typeof Notification !== "undefined"
      ? Notification.permission
      : "default"
  );
  const didInit = useRef(false);
  const lastUserId = useRef(null);

  // Register the service worker once (idempotent).
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register(SW_PATH)
        .catch((e) => console.error("SW registration failed", e));
    }
  }, []);

  // Tell the service worker the current locale so notification clicks open
  // the right language (the SW can't read next-intl on its own).
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready
      .then((registration) =>
        registration.active?.postMessage({ type: "SET_LOCALE", locale })
      )
      .catch(() => {});
  }, [locale]);

  // Keep the React `permission` state in sync with the browser. The user can
  // grant notifications from the address-bar controls (site settings) without
  // ever going through our button, and Chrome/Firefox can change the state at
  // any time — without this listener the UI keeps reporting the value it read
  // on mount ("default") even though the browser already says "granted".
  useEffect(() => {
    if (typeof window === "undefined" || !("permissions" in navigator)) return;
    let status = null;
    let cancelled = false;

    const sync = () => {
      if (!status) return;
      // The Permissions API uses "prompt" where Notification uses "default".
      const next = status.state === "prompt" ? "default" : status.state;
      console.info("[velvet-fcm] permission changed:", next);
      setPermission(next);
    };

    navigator.permissions
      .query({ name: "notifications" })
      .then((s) => {
        if (cancelled) return;
        status = s;
        sync();
        s.onchange = sync;
      })
      .catch((e) => console.warn("[velvet-fcm] permissions.query failed", e));

    return () => {
      cancelled = true;
      if (status) status.onchange = null;
    };
  }, []);

  // On logout / user switch: drop that user's stored token (and any stale
  // legacy key) so the next login on this browser registers a fresh one.
  useEffect(() => {
    if (!_hasHydrated) return;
    if (lastUserId.current !== userId) {
      if (lastUserId.current != null) {
        localStorage.removeItem(getTokenStorageKey(lastUserId.current));
      }
      localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
      lastUserId.current = userId;
    }
  }, [_hasHydrated, userId]);

  // Foreground message → toast + invalidate bell list.
  useEffect(() => {
    let unsub = null;
    (async () => {
      const messaging = await getFirebaseMessaging();
      if (!messaging) return;
      unsub = onMessage(messaging, (payload) => {
        const data = payload.data || {};
        const title = data.title || payload.notification?.title || "Velvet";
        const body = data.body || payload.notification?.body || "";
        toast(`${title}${body ? ` — ${body}` : ""}`, {
          icon: "🔔",
          duration: 5000,
        });
        queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
      });
    })();
    return () => unsub?.();
  }, [queryClient]);

  // When the user becomes authenticated (or the browser permission becomes
  // "granted" later, e.g. via the address-bar controls), register the FCM token.
  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated || !userId) {
      if (_hasHydrated && isAuthenticated && !userId) {
        console.warn(
          "[velvet-fcm] authenticated but the stored user has no id; sign out and sign in again"
        );
      }
      return;
    }

    let cancelled = false;
    let unsubUnregistered = null;
    (async () => {
      try {
        // If permission isn't granted yet, defer to the bell click.
        if (typeof Notification === "undefined") return;
        if (Notification.permission !== "granted") return;

        const messaging = await getFirebaseMessaging();
        if (!messaging || cancelled) return;

        // Firebase 12 has no onTokenRefresh: getToken() transparently returns
        // a rotated token. Re-register on every login so the backend always
        // holds a current token (it may have been cleared server-side).
        const currentToken = await requestDeviceToken(messaging);
        if (currentToken && !cancelled) {
          await registerDeviceToken(currentToken);
          localStorage.setItem(getTokenStorageKey(userId), currentToken);
          queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
        }

        // If FCM invalidates/unregisters the token (e.g. server-side cleanup),
        // drop our stored copies so the next login registers a fresh one.
        unsubUnregistered = onUnregistered(messaging, async () => {
          if (cancelled || !userId) return;
          localStorage.removeItem(getTokenStorageKey(userId));
          try {
            const fresh = await requestDeviceToken(messaging);
            if (fresh && !cancelled) {
              await registerDeviceToken(fresh);
              localStorage.setItem(getTokenStorageKey(userId), fresh);
              queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
            }
          } catch (e) {
          }
        });
      } catch (e) {
        console.warn("[velvet-fcm] automatic token registration failed", e);
      }
    })();
    return () => {
      cancelled = true;
      unsubUnregistered?.();
    };
  }, [_hasHydrated, isAuthenticated, userId, permission, queryClient]);

  const requestFcmPermission = async () => {
    try {
      if (typeof window === "undefined" || typeof Notification === "undefined") {
        return "unsupported:the Notification API is not available in this browser";
      }

      // Ask the browser FIRST, directly from the click gesture. Doing any
      // async Firebase work before this can make the prompt never appear.
      // If it is already granted (e.g. the user allowed it from the address
      // bar) there is nothing to prompt: just continue to token registration.
      const alreadyGranted = Notification.permission === "granted";
      const perm = alreadyGranted
        ? "granted"
        : await Notification.requestPermission();
      setPermission(perm);
      console.info("[velvet-fcm] permission:", perm);
      if (perm === "default") return "dismissed";
      if (perm !== "granted") return perm;

      if (!userId) return "no-user";

      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        const reason = getFirebaseFailureReason() || "unknown reason";
        console.warn("[velvet-fcm] messaging unavailable", {
          reason,
          checks: getPushSupportReport(),
        });
        return `unsupported:${reason}`;
      }

      let currentToken;
      try {
        currentToken = await requestDeviceToken(messaging);
      } catch (e) {
        const reason = `${e?.code || e?.name || "error"}: ${e?.message || e}`;
        console.error("[velvet-fcm] getToken failed", e);
        return `token-error:${reason}`;
      }
      console.info("[velvet-fcm] device token:", currentToken ? "acquired" : "empty");
      if (!currentToken) return "no-token";

      await registerDeviceToken(currentToken);
      localStorage.setItem(getTokenStorageKey(userId), currentToken);
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
      return "granted";
    } catch (e) {
      console.error("[velvet-fcm] permission request failed", e);
      return `error:${e?.code || e?.name || "error"}: ${e?.message || e}`;
    }
  };

  return (
    <NotificationsContext.Provider value={{ permission, requestFcmPermission }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export default NotificationsProvider;
