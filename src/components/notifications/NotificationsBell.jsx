"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useNotificationsFcm } from "./NotificationsProvider";
import NotificationsDropdown from "./NotificationsDropdown";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useAuthStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks/useHydration";
import { FaBell } from "react-icons/fa";
import toast from "react-hot-toast";

/**
 * Bell icon + dropdown. Mounted in NavBar (desktop) and NavbarMobile.
 * The bell click triggers the browser permission prompt (user gesture),
 * via requestFcmPermission() from the root NotificationsProvider.
 */
export default function NotificationsBell({ variant = "desktop" }) {
  const t = useTranslations("notifications");
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const hydrated = useHydrated();
  const { requestFcmPermission } = useNotificationsFcm();
  const { data } = useNotifications(1, 20, { enabled: open || isAuthenticated });

  const items = data?.data || [];
  const unreadCount = items.filter((n) => !n.isRead).length;

  const handleClick = async () => {
    setOpen((prev) => !prev);
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      const result = await requestFcmPermission();
      if (result === "granted") {
        toast.success(t("permission_granted"));
      } else if (result === "denied") {
        toast.error(t("permission_denied"));
      }
    }
  };

  // Only show bell for logged-in users after hydration
  if (!hydrated || !isAuthenticated) return null;

  return (
    <div
      className={`relative ${
        variant === "mobile" ? "flex flex-col items-center justify-center group" : ""
      }`}
    >
      <button
        onClick={handleClick}
        className={`relative flex items-center justify-center transition-opacity ${
          variant === "mobile"
            ? "w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-200"
            : "hover:opacity-70"
        }`}
        aria-label={t("title")}
      >
        <FaBell className="text-lg text-[#333]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* {variant === "mobile" && (
        <span className="text-xs text-gray-600 mt-1">Notifications</span>
      )} */}

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <NotificationsDropdown open={open} onClose={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}
