/* global importScripts, firebase */
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Firebase config is served from /api/firebase-config (the service worker
// can't read build-time env vars, and this keeps .env.local the single source).
self.addEventListener("install", () => self.skipWaiting());

let initialized = false;

async function initFirebase() {
  if (initialized) return;
  try {
    const res = await fetch("/api/firebase-config");
    const { firebaseConfig, vapidKey } = await res.json();
    if (!firebaseConfig || !firebaseConfig.messagingSenderId) return;

    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();
    initialized = true;
    self.__vapidKey = vapidKey;
  } catch (e) {
    console.error("[firebase-sw] init failed", e);
  }
}

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  // Wake-up from the page (registration + getToken flow).
  initFirebase();
  const data = event.data;
  if (!data) return;
  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
  } else if (data.type === "SET_LOCALE") {
    // The page pushes the active locale here so click-through URLs open in the
    // right language (e.g. /ar/dashboard/... vs /en/...).
    self.__locale = data.locale === "ar" ? "ar" : "en";
  }
});

self.addEventListener("push", (event) => {
  event.waitUntil(handlePush(event));
});

async function handlePush(event) {
  await initFirebase();
  try {
    let data = {};
    if (event.data) {
      const payload = event.data.json();
      data = payload.data || payload;
    }
    const title = data.title || "Velvet";
    const body = data.body || "";
    const icon = data.image || "/images/logo/velvet-logo-typo-big.svg";
    const tag = data.type || "velvet-notification";

    let payloadObj = {};
    try {
      payloadObj = data.payload ? JSON.parse(data.payload) : {};
    } catch (e) {
      payloadObj = {};
    }

    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon,
        badge: "/images/logo/velvet-logo-typo-big.svg",
        tag,
        data: {
          ...payloadObj,
          url: payloadObj.order_id
            ? `/${self.__locale || "en"}/dashboard/orders/${payloadObj.order_id}`
            : `/${self.__locale || "en"}`,
        },
      })
    );
  } catch (e) {
    console.error("[firebase-sw] push handling failed", e);
  }
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
