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

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const items = data?.data || [];
  const pagination = data?.pagination;
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
          <p className="text-center text-sm text-red-500 py-10">{t("load_error")}</p>
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
