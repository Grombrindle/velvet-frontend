// lib/services/notificationService.js

import { apiGet, apiPost, apiPut } from "./api";

/**
 * Backend contract (Laravel, `/api/notifications`, auth:sanctum):
 *  - POST /token           { fcm_token }  → saves token + subscribes to order_{userId} topic
 *  - PUT  /token           { fcm_token }  → replaces token + subscribes to "all" topic
 *  - GET  /paginate?page=&size=           → { data: [...], pagination: {...} }
 *  - GET  /preferences                    → { notification_enabled, notification_sound_enabled }
 *  - PUT  /preferences                    → update one/both flags
 *  - POST /test-sound                     → self-test push to current user's token
 */

export async function registerDeviceToken(fcmToken) {
    return apiPost("/notifications/token", { fcm_token: fcmToken });
}

export async function updateDeviceToken(fcmToken) {
    return apiPut("/notifications/token", { fcm_token: fcmToken });
}

export async function fetchNotifications({ page = 1, size = 20 } = {}) {
    try {
        const response = await apiGet("/notifications/paginate", {
            params: { page, size },
        });

        // Log the response to debug

        // ✅ Return the full response with both result and pagination
        // The response should have this structure:
        // {
        //   success: true,
        //   result: [...],
        //   pagination: { ... }
        // }
        return response;

    } catch (error) {
        // Return a fallback response structure
        return {
            success: false,
            result: [],
            pagination: null,
            error: error.message
        };
    }
}

export async function fetchNotificationPreferences() {
    try {
        const response = await apiGet("/notifications/preferences");
        // ✅ Return the full response or just the preferences object
        if (response && response.result) {
            return response.result;
        }
        return response || { notification_enabled: true, notification_sound_enabled: true };
    } catch (error) {
        return { notification_enabled: true, notification_sound_enabled: true };
    }
}

export async function updateNotificationPreferences(payload) {
    return apiPut("/notifications/preferences", payload);
}

export async function sendTestNotification() {
    return apiPost("/notifications/test-sound");
}

export async function markNotificationsRead(ids = []) {
    return apiPost("/notifications/read", ids.length ? { ids } : {});
}