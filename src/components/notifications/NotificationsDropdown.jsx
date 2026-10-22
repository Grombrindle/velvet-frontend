"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  useNotifications,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useMarkNotificationsRead,
} from "@/lib/hooks/useNotifications";
import { useHydrated } from "@/lib/hooks/useHydration";
import { useNotificationsFcm } from "./NotificationsProvider";
import Loader from "../ui/loader";

// Simple relative-time formatter (no dep): "now", "5m", "2h", "3d"
function timeAgo(iso, locale) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return locale === "ar" ? "الآن" : "now";
  if (mins < 60) return locale === "ar" ? `منذ ${mins} د` : `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return locale === "ar" ? `منذ ${hours} س` : `${hours}h`;
  const days = Math.floor(hours / 24);
  return locale === "ar" ? `منذ ${days} ي` : `${days}d`;
}

const TYPE_ICONS = {
  orderUpdate: "📦",
  promotion: "🏷️",
  systemUpdate: "ℹ️",
  newMessage: "✉️",
};

export default function NotificationsDropdown({ open, onClose }) {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const router = useRouter();
  const hydrated = useHydrated();

  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useNotifications(page, 20);
  const {
    data: prefs,
    isLoading: prefsLoading,
  } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();
  const markRead = useMarkNotificationsRead();

  const { permission, requestFcmPermission, sendTest } = useNotificationsFcm();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null); // { key, ok }

  const permissionKey =
    permission === "granted"
      ? "permission_state_granted"
      : permission === "denied"
        ? "permission_state_denied"
        : "permission_state_default";

  const describe = (result) => {
    if (typeof result !== "string") return { key: "test_error", ok: false };
    if (result === "granted") return { key: "permission_granted", ok: true };
    if (result === "denied") return { key: "permission_denied", ok: false };
    if (result === "dismissed") return { key: "permission_dismissed", ok: false };
    if (result === "no-user") return { key: "permission_no_user", ok: false };
    if (result === "no-token") return { key: "no_token", ok: false };
    if (result.startsWith("unsupported")) {
      return {
        key: "permission_unsupported",
        ok: false,
        detail: result.replace(/^unsupported:?/, ""),
      };
    }
    if (result.startsWith("token-error")) {
      return {
        key: "no_token",
        ok: false,
        detail: result.replace(/^token-error:?/, ""),
      };
    }
    if (result.startsWith("error")) {
      return {
        key: "test_error",
        ok: false,
        detail: result.replace(/^error:?/, ""),
      };
    }
    return { key: "test_error", ok: false };
  };

  const sendErrorFeedback = (result) => {
    const msg = typeof result === "string" ? result.replace(/^error:?/, "") : "";
    setFeedback({ key: "test_error", ok: false, detail: msg });
  };

  const enable = async () => {
    const result = await requestFcmPermission();
    setFeedback(describe(result));
    return result;
  };

  const sendNow = async () => {
    setBusy(true);
    try {
      if (permission !== "granted") {
        const result = await requestFcmPermission();
        if (result !== "granted") {
          setFeedback(describe(result));
          return;
        }
      }
      setFeedback({ key: "test_sending", ok: true });
      const result = await sendTest();
      if (result === "sent") {
        setFeedback({ key: "test_sent", ok: true });
      } else if (result === "failed") {
        setFeedback({ key: "test_failed", ok: false });
      } else {
        sendErrorFeedback(result);
      }
    } finally {
      setBusy(false);
    }
  };

  const sendIn5s = async () => {
    if (permission !== "granted") {
      const result = await requestFcmPermission();
      if (result !== "granted") {
        setFeedback(describe(result));
        return;
      }
    }
    setFeedback({ key: "test_scheduled", ok: true });
    // Gives you time to switch tabs so the system notification is visible.
    setTimeout(async () => {
      setBusy(true);
      try {
        const result = await sendTest();
        if (result === "sent") {
          setFeedback({ key: "test_sent", ok: true });
        } else if (result === "failed") {
          setFeedback({ key: "test_failed", ok: false });
        } else {
          sendErrorFeedback(result);
        }
      } finally {
        setBusy(false);
      }
    }, 5000);
  };

 
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Try multiple ways to access the data
  // Backend shape: { success, result: { data: [...], pagination: {...} } }
  const list = data?.result ?? data;
  const items = Array.isArray(list)
    ? list
    : Array.isArray(list?.data)
      ? list.data
      : Array.isArray(list?.notifications)
        ? list.notifications
        : [];
  const pagination =
    (!Array.isArray(list) && list?.pagination) || data?.pagination || null;
  const unreadCount = items.filter((n) => !n.isRead).length;


  const handleOpenNotification = (n) => {
    if (!n.isRead) markRead.mutate([n.id]);
    const payload = n.payload || {};
    if (payload.order_id) {
      router.push(`/${locale}/dashboard/orders/${payload.order_id}`);
      onClose();
    }
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0) markRead.mutate([]);
  };

  const togglePref = (key) => {
    updatePrefs.mutate({ [key]: !prefs?.[key] });
  };

  return (
    <div
      className={`fixed inset-x-2 top-16 z-30 sm:absolute sm:inset-x-auto sm:top-full sm:mt-3 sm:w-96 ${
        locale === "ar" ? "sm:left-0" : "sm:right-0"
      } bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-slate-800 truncate">{t("title")}</h3>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-slate-500 hover:text-black transition-colors whitespace-nowrap"
            >
              {t("mark_all_read")}
            </button>
            <span className="text-xs bg-black text-white rounded-full px-2 py-0.5 shrink-0">
              {unreadCount}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="max-h-[min(60vh,24rem)] sm:max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader text={t("loading")} />
          </div>
        ) : error ? (
          <p className="text-center text-sm text-red-500 py-10">
            {t("load_error")}: {error.message}
          </p>
        ) : items.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-10">{t("empty")}</p>
        ) : (
          items.map((n) => (
            <button
              key={n.id}
              onClick={() => handleOpenNotification(n)}
              className={`w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                !n.isRead ? "bg-blue-50/50" : ""
              }`}
            >
              <span className="text-lg mt-0.5">{TYPE_ICONS[n.type] || "🔔"}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-slate-800 truncate">
                  {n.title}
                </span>
                <span className="block text-xs text-gray-500 line-clamp-2">
                  {n.body}
                </span>
                <span className="block text-[10px] text-gray-400 mt-1">
                  {timeAgo(n.timestamp, locale)}
                </span>
              </span>
            </button>
          ))
        )}
      </div>

      {/* Footer: load more + settings */}
      <div className="px-4 py-3 border-t border-gray-100 space-y-2">
        {/* Device permission + on-demand test push */}
        <div className="space-y-2 pb-2 border-b border-gray-100">
          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>
              {t("permission_label")}:{" "}
              <b
                className={
                  permission === "granted" ? "text-green-600" : "text-slate-700"
                }
              >
                {t(permissionKey)}
              </b>
            </span>
            {permission !== "granted" && (
              <button
                onClick={enable}
                className="underline hover:text-black whitespace-nowrap"
              >
                {t("enable_now")}
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={sendNow}
              disabled={busy}
              className="flex-1 text-xs font-semibold bg-black text-white rounded-lg py-2 disabled:opacity-50 hover:bg-slate-800 transition-colors"
            >
              {busy ? t("test_sending") : t("test_notification")}
            </button>
            <button
              onClick={sendIn5s}
              disabled={busy}
              className="text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 disabled:opacity-50 hover:bg-slate-50 transition-colors"
            >
              {t("test_in_5s")}
            </button>
          </div>

          {feedback && (
            <div>
              <p
                className={`text-[11px] ${
                  feedback.ok ? "text-green-600" : "text-red-500"
                }`}
              >
                {t(feedback.key)}
              </p>
              {feedback.detail && (
                <p className="mt-1 text-[10px] leading-snug text-slate-500 font-mono break-words">
                  {feedback.detail}
                </p>
              )}
            </div>
          )}
        </div>

        {pagination && page < pagination.last_page && (
          <button
            onClick={() => setPage((p) => p + 1)}
            className="w-full text-xs text-center text-slate-600 hover:text-black py-1"
          >
            {t("load_more")}
          </button>
        )}

        {!prefsLoading && prefs && (
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>{t("enable_label")}</span>
            <button
              onClick={() => togglePref("notification_enabled")}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                prefs.notification_enabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  prefs.notification_enabled ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}