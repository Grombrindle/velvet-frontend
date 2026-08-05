"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/lib/store";
import { getFirebaseMessaging } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
import { registerDeviceToken } from "@/lib/notifications";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const SW_PATH = "/firebase-messaging-sw.js";
// Legacy key (pre multi-user support). Kept so stale entries get cleaned up.
const LEGACY_TOKEN_STORAGE_KEY = "velvet_fcm_token";

// Keyed per user so a second login on the same browser re-registers its own
// token instead of reusing (or skipping) the previous user's.
const getTokenStorageKey = (userId) => `velvet_fcm_token_${userId}`;

const NotificationsContext = createContext({
  permission: "default",
  requestFcmPermission: async () => "unsupported",
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

  // When the user becomes authenticated, register the FCM token.
  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated || !userId) return;
    const storedToken = localStorage.getItem(getTokenStorageKey(userId));
    if (storedToken) return; // already registered for this user this session

    let cancelled = false;
    (async () => {
      try {
        const messaging = await getFirebaseMessaging();
        if (!messaging) return;
        // If permission isn't granted yet, defer to the bell click.
        if (Notification.permission !== "granted") return;

        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        if (currentToken && !cancelled) {
          await registerDeviceToken(currentToken);
          localStorage.setItem(getTokenStorageKey(userId), currentToken);
          queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
        }
      } catch (e) {
        console.error("FCM token registration failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [_hasHydrated, isAuthenticated, userId, queryClient]);

  const requestFcmPermission = async () => {
    try {
      const messaging = await getFirebaseMessaging();
      if (!messaging) return "unsupported";
      if (!userId) return "denied";

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return perm;

      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      if (currentToken) {
        await registerDeviceToken(currentToken);
        localStorage.setItem(getTokenStorageKey(userId), currentToken);
        queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
      }
      return "granted";
    } catch (e) {
      console.error("FCM permission request failed", e);
      return "denied";
    }
  };

  return (
    <NotificationsContext.Provider value={{ permission, requestFcmPermission }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export default NotificationsProvider;
