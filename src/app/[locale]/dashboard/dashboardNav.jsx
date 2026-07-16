"use client";
import LogoutPopup from "@/components/logout/logoutPopup";
import { getLocalePrefix } from "@/lib/locale";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function DashboardNav() {
  const pathname = usePathname();
  const localePrefix = getLocalePrefix(pathname);

  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const t = useTranslations("dashboardMenu");

const items = [
  {
    id: 1,
    image: "/images/profile.svg",
    desc: t("myProfile"),
    path: `${localePrefix}/dashboard/profile`,
  },
  {
    id: 2,
    image: "/images/order.svg",
    desc: t("myOrders"),
    path: `${localePrefix}/dashboard/orders`,
  },
  {
    id: 3,
    image: "/images/address.svg",
    desc: t("myAddresses"),
    path: `${localePrefix}/dashboard/address`,
  },
  {
    id: 4,
    image: "/images/heart-dash.svg",
    desc: t("myFavorites"),
    path: `${localePrefix}/dashboard/favorite`,
  },
  {
    id: 6,
    image: "/images/email-dash.svg",
    desc: t("faq"),
    path: `${localePrefix}/dashboard/faq`,
  },
  {
    id: 7,
    image: "/images/privacy.svg",
    desc: t("privacy policy"),
    path: `${localePrefix}/dashboard/privacy-policy`,
  },
  {
    id: 8,
    image: "/images/currency.svg",
    desc: t("currency"),
    path: `${localePrefix}/dashboard/currency`,
  },
  {
    id: 9,
    image: "/images/logout.svg",
    desc: t("Logout"),
    path: `${localePrefix}/dashboard/logout`,
    isLogout: true,
  },
];

  const handleItemClick = (item) => {
    if (item.isLogout) {
      // Prevent navigation and show popup instead
      setShowLogoutPopup(true);
      setIsOpen(false); // Close mobile menu if open
    } else {
      // For other items, let the Link handle navigation
      // We'll handle this in the Link component
    }
  };

  const handleClosePopup = () => {
    setShowLogoutPopup(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-0 right-0 z-50 flex items-center gap-4 pl-2 h-14">
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
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold">Dashboard</h2>
          <button onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <div className="overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.path;

            if (item.isLogout) {
              // Render logout as button instead of Link
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

            // Render regular links for other items
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
      <aside className="hidden lg:block w-68 bg-white border-r border-slate-200">
        <div className="overflow-y-auto h-full pb-20">
          {items.map((item) => {
            const isActive = pathname === item.path;

            if (item.isLogout) {
              // Render logout as button for desktop
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

            // Render regular links for other items
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