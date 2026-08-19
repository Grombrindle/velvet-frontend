"use client";
import LogoutPopup from "@/components/logout/logoutPopup";
import { getLocalePrefix } from "@/lib/locale";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/lib/store"; // Import your auth store

export default function DashboardNav() {
  const pathname = usePathname();
  const localePrefix = getLocalePrefix(pathname);
  const currentLocale = useLocale();
  const isRTL = currentLocale === "ar";
  
  // Get authentication state
  const { isAuthenticated } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const t = useTranslations("dashboardMenu");

  // Define all items
  const allItems = [
    {
      id: 1,
      image: "/images/profile.svg",
      desc: t("myProfile"),
      path: `${localePrefix}/dashboard/profile`,
      requiresAuth: true, // Mark as requiring authentication
    },
    {
      id: 2,
      image: "/images/order.svg",
      desc: t("myOrders"),
      path: `${localePrefix}/dashboard/orders`,
      requiresAuth: true,
    },
    {
      id: 3,
      image: "/images/address.svg",
      desc: t("myAddresses"),
      path: `${localePrefix}/dashboard/address`,
      requiresAuth: true,
    },
    {
      id: 4,
      image: "/images/heart-dash.svg",
      desc: t("myFavorites"),
      path: `${localePrefix}/dashboard/favorite`,
      requiresAuth: true,
    },
    {
      id: 6,
      image: "/images/email-dash.svg",
      desc: t("faq"),
      path: `${localePrefix}/dashboard/faq`,
      requiresAuth: false, // Public
    },
    {
      id: 7,
      image: "/images/privacy.svg",
      desc: t("privacy policy"),
      path: `${localePrefix}/dashboard/privacy-policy`,
      requiresAuth: false, // Public
    },
    {
      id: 8,
      image: "/images/currency.svg",
      desc: t("currency"),
      path: `${localePrefix}/dashboard/currency`,
      requiresAuth: true, // Public
    },
    {
      id: 9,
      image: "/images/logout.svg",
      desc: t("Logout"),
      path: `${localePrefix}/dashboard/logout`,
      isLogout: true,
      requiresAuth: true, // Only show when logged in
    },
  ];

  // Filter items based on authentication
  const items = allItems.filter(item => {
    // If item requires auth and user is not authenticated, hide it
    if (item.requiresAuth && !isAuthenticated) {
      return false;
    }
    return true;
  });

  const handleItemClick = (item) => {
    if (item.isLogout) {
      setShowLogoutPopup(true);
      setIsOpen(false);
    }
  };

  const handleClosePopup = () => {
    setShowLogoutPopup(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className={`lg:hidden fixed top-4 ${isRTL ? 'right-0 pr-2' : 'left-0 pl-2'} z-50 flex items-center gap-4 h-14`}>
        <button onClick={() => setIsOpen(true)}>
          <div className="space-y-1">
            <span className="block w-6 h-0.5 bg-black"></span>
            <span className="block w-6 h-0.5 bg-black"></span>
            <span className="block w-6 h-0.5 bg-black"></span>
          </div>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-72 bg-white z-50 transform transition-transform duration-300 lg:hidden ${
          isOpen 
            ? isRTL ? "translate-x-0" : "translate-x-0"
            : isRTL ? "translate-x-full" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <button onClick={() => setIsOpen(false)} className="text-xl">
            {isRTL ? "✕" : "✕"}
          </button>
        </div>

        <div className="overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.path;

            if (item.isLogout) {
              return (
                <div key={item.id} onClick={() => handleItemClick(item)}>
                  <div
                    className={`flex items-center gap-x-4 px-6 mt-4 cursor-pointer transition-colors ${
                      isActive
                        ? "bg-[#333333] text-white py-4"
                        : "hover:bg-gray-50 py-3 text-[#333333]"
                    }`}
                  >
                    <Image
                      className={`w-6 ${isActive ? "brightness-0 invert" : ""}`}
                      width={24}
                      height={24}
                      alt={item.desc}
                      src={item.image}
                    />
                    <p className="text-sm">{item.desc}</p>
                  </div>
                </div>
              );
            }

            return (
              <Link
                href={item.path}
                key={item.id}
                onClick={() => setIsOpen(false)}
              >
                <div
                  className={`flex items-center gap-x-4 px-6 mt-4 cursor-pointer transition-colors ${
                    isActive
                      ? "bg-[#333333] text-white py-4"
                      : "hover:bg-gray-50 py-3 text-[#333333]"
                  }`}
                >
                  <Image
                    className={`w-6 ${isActive ? "brightness-0 invert" : ""}`}
                    width={24}
                    height={24}
                    alt={item.desc}
                    src={item.image}
                  />
                  <p className="text-sm">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:block w-68 ${isRTL ? 'border-l' : 'border-r'} border-slate-200`}>
        <div className="overflow-y-auto h-full pb-20">
          {items.map((item) => {
            const isActive = pathname === item.path;

            if (item.isLogout) {
              return (
                <div key={item.id} onClick={() => handleItemClick(item)}>
                  <div
                    className={`flex items-center gap-x-4 px-10 py-5 cursor-pointer transition-colors ${
                      isActive
                        ? "bg-[#333333] text-white font-bold"
                        : "hover:bg-gray-50 text-[#333333]"
                    }`}
                  >
                    <Image
                      className={`w-6 ${isActive ? "brightness-0 invert" : ""}`}
                      width={24}
                      height={24}
                      alt={item.desc}
                      src={item.image}
                    />
                    <p className="text-[0.9rem]">{item.desc}</p>
                  </div>
                </div>
              );
            }

            return (
              <Link href={item.path} key={item.id}>
                <div
                  className={`flex items-center gap-x-4 px-10 py-5 cursor-pointer transition-colors ${
                    isActive
                      ? "bg-[#333333] text-white font-bold"
                      : "hover:bg-gray-50 text-[#333333]"
                  }`}
                >
                  <Image
                    className={`w-6 ${isActive ? "brightness-0 invert" : ""}`}
                    width={24}
                    height={24}
                    alt={item.desc}
                    src={item.image}
                  />
                  <p className="text-[0.9rem]">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Logout Popup */}
      {showLogoutPopup && <LogoutPopup onClose={handleClosePopup} />}
    </>
  );
}