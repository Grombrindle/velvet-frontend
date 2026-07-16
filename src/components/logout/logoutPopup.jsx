"use client";
import React, { useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { getLocalePrefix } from "@/lib/locale";
import { useTranslations } from "next-intl";

const LogoutPopup = ({ onClose }) => {
    const t = useTranslations("logout");
  
   const pathname = usePathname();
    const localePrefix = getLocalePrefix(pathname);
  const router = useRouter();
  const { clear } = useAuthStore();
  const popupRef = useRef(null);

  // Handle logout confirmation
  const handleLogout = () => {
    clear();
    router.push(`${localePrefix}/login`);
  };

  // Handle cancel - just close the popup, stay on current page
  const handleCancel = useCallback(() => {
    if (onClose) {
      onClose(); // Call the onClose function passed from parent
    }
  }, [onClose]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        handleCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleCancel]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [handleCancel]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={popupRef}
        className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-xl transform transition-all"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{t("Logout")}</h3>
        <p className="text-gray-600 mb-6">
{t("sure_logout")}        </p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleCancel}
            className="px-6 py-2 cursor-pointer border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            {t("Cancel")}
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-2 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            {t("Yes, Logout")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutPopup;