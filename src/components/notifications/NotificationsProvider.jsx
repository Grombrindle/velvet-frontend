"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store";
import { getFirebaseMessaging } from "@/lib/firebase";
import { getToken, onMessage, onUnregistered } from "firebase/messaging";
import { registerDeviceToken, sendTestNotification } from "@/lib/notifications";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const SW_PATH = "/firebase-messaging-sw.js";
// Legacy key (pre multi-user support). Kept so stale entries get cleaned up.
const LEGACY_TOKEN_STORAGE_KEY = "velvet_fcm_token";

// Keyed per user so a second login on the same browser re-registers its own
// token instead of reusing (or skipping) the previous user's.
const getTokenStorageKey = (userId) => `velvet_fcm_token_${userId}`;

// One-time self-test flag per user+browser so we verify the push loop works
// without spamming a "Sound Test Notification" on every reload.
const getVerifiedStorageKey = (userId) => `velvet_push_verified_${userId}`;

// FCM tokens shouldn't be requested until the service worker is active,
// otherwise getToken can fail with a "registration did not exist" error.
async function requestDeviceToken(messaging) {
  await navigator.serviceWorker.ready;
  return getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  });
}

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
  const t = useTranslations("notifications");
  const { isAuthenticated, _hasHydrated, user } = useAuthStore();
  const userId = user?.id ?? null;
  const [permission, setPermission] = useState(
    typeof window !== "undefined" && typeof Notification !== "undefined"
      ? Notification.permission
      : "default"
  );
  const didInit = useRef(false);
  const lastUserId = useRef(null);

  // Self-test: right after a successful token registration (once per user +
  // browser) ask the backend to push a real notification to this device. This
  // proves the whole FCM loop works without needing a Postman/curl token.
  const verifyPushOnce = useMemo(
    () => async (uid) => {
      const key = getVerifiedStorageKey(uid);
      if (localStorage.getItem(key)) return;
      try {
        const res = await sendTestNotification();
        localStorage.setItem(key, "1");
        if (res?.result?.notification_sent) {
          toast(t("push_verified"), { icon: "🔔", duration: 5000 });
        } else {
          toast.error(t("push_verify_failed"), { duration: 6000 });
        }
      } catch (e) {
        localStorage.removeItem(key); // allow a retry next time
        console.error("Push self-test failed", e);
      }
    },
    [t]
  );

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

    let cancelled = false;
    let unsubUnregistered = null;
    (async () => {
      try {
        const messaging = await getFirebaseMessaging();
        if (!messaging || cancelled) return;
        // If permission isn't granted yet, defer to the bell click.
        if (Notification.permission !== "granted") return;

        // Firebase 12 has no onTokenRefresh: getToken() transparently returns
        // a rotated token, so on every login we compare it to what the backend
        // has and re-register when it changed.
        const currentToken = await requestDeviceToken(messaging);
        if (currentToken && !cancelled && currentToken !== storedToken) {
          await registerDeviceToken(currentToken);
          localStorage.setItem(getTokenStorageKey(userId), currentToken);
          queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
          verifyPushOnce(userId);
        }

        // If FCM invalidates/unregisters the token (e.g. server-side cleanup),
        // drop our stored copies so the next login registers a fresh one.
        unsubUnregistered = onUnregistered(messaging, async () => {
          if (cancelled || !userId) return;
          localStorage.removeItem(getTokenStorageKey(userId));
          localStorage.removeItem(getVerifiedStorageKey(userId));
          try {
            const fresh = await requestDeviceToken(messaging);
            if (fresh && !cancelled) {
              await registerDeviceToken(fresh);
              localStorage.setItem(getTokenStorageKey(userId), fresh);
              queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
            }
          } catch (e) {
            console.error("FCM re-registration after unregister failed", e);
          }
        });
      } catch (e) {
        console.error("FCM token registration failed", e);
      }
    })();
    return () => {
      cancelled = true;
      unsubUnregistered?.();
    };
  }, [_hasHydrated, isAuthenticated, userId, queryClient, verifyPushOnce]);

  const requestFcmPermission = async () => {
    try {
      const messaging = await getFirebaseMessaging();
      if (!messaging) return "unsupported";
      if (!userId) return "denied";

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return perm;

      const currentToken = await requestDeviceToken(messaging);
      if (currentToken) {
        await registerDeviceToken(currentToken);
        localStorage.setItem(getTokenStorageKey(userId), currentToken);
        queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
        verifyPushOnce(userId);
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
