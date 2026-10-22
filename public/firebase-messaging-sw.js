/* Velvet Firebase Cloud Messaging service worker.
 *
 * FCM only needs a service worker that handles "push" events. The Firebase
 * SDK is intentionally NOT imported here: loading it lazily inside the push
 * handler registers push/notificationclick listeners too late (Chrome logs
 * "Event handler ... must be added on the initial evaluation of worker
 * script") and adds a network round-trip before the notification is shown.
 */

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
    const data = event.data;
    if (!data) return;
    if (data.type === "SKIP_WAITING") {
        self.skipWaiting();
    } else if (data.type === "SET_LOCALE") {
        // The page pushes the active locale here so click-through URLs open in
        // the right language (e.g. /ar/dashboard/... vs /en/...).
        self.__locale = data.locale === "ar" ? "ar" : "en";
    }
});

self.addEventListener("push", (event) => {
    event.waitUntil(handlePush(event));
});

async function handlePush(event) {
    try {
        let payload = {};
        if (event.data) {
            try {
                payload = event.data.json();
            } catch (e) {
                payload = { notification: { body: event.data.text() } };
            }
        }

        // FCM HTTP v1 puts custom keys in `data`; `notification` is present
        // for notification messages.
        const data = payload.data || {};
        const notification = payload.notification || {};
        const title = data.title || notification.title || "Velvet";
        const body = data.body || notification.body || "";
        const icon = data.image || notification.icon || "/images/logo/logo-velvet-edit.png";
        const tag = data.type || "velvet-notification";

        let extra = {};
        try {
            extra = data.payload ? JSON.parse(data.payload) : {};
        } catch (e) {
            extra = {};
        }

        const url = extra.order_id
            ? `/${self.__locale || "en"}/dashboard/orders/${extra.order_id}`
            : `/${self.__locale || "en"}`;

        await self.registration.showNotification(title, {
            body,
            icon,
            badge: "/images/logo/logo-velvet-edit.png",
            tag,
            data: { ...extra, url },
        });
    } catch (e) {
        console.error("[velvet-sw] push handling failed", e);
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
