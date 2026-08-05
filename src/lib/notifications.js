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
  const response = await apiGet("/notifications/paginate", {
    params: { page, size },
  });
  if (response?.success && response?.result) {
    return response.result; // { data, pagination }
  }
  return { data: [], pagination: null };
}

export async function fetchNotificationPreferences() {
  const response = await apiGet("/notifications/preferences");
  if (response?.success && response?.result) {
    return response.result;
  }
  return { notification_enabled: true, notification_sound_enabled: true };
}

export async function updateNotificationPreferences(payload) {
  return apiPut("/notifications/preferences", payload);
}

export async function sendTestNotification() {
  return apiPost("/notifications/test-sound");
}
