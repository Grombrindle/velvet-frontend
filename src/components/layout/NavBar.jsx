"use client";
import React, { Suspense, useState } from "react";
import Image from "next/image";
import { IoIosLogOut, IoIosSettings } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import CategoryDropdown from "./CategoryDropdown";
import CartMenu from "./CartMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationsBell from "../notifications/NotificationsBell";
import { useAuthStore } from "@/lib/store";
import NavbarDashboard from "./Navbar-dashboard";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { getGenderFromPathname, getLocalePrefix } from "@/lib/locale";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/components/cart/hooks/useCart";

function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const localePrefix = getLocalePrefix(pathname);

  const currentGender = getGenderFromPathname(pathname, searchParams);

  const t = useTranslations("navbar");

  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, isAuthenticated, clear } = useAuthStore();

  const currentLocale = useLocale();
  const { data: cart } = useCart({ enabled: isAuthenticated });
  const cartCount = cart?.totalCount || 0;

  const handleLogout = () => {
    clear();
    setUserMenuOpen(false);
    router.push(`${localePrefix}/login`);
  };

  const {
    data: gendersData,
    isLoading: gendersLoading,
    error: gendersError,
  } = useQuery({
    queryKey: ["genders-web"],
    queryFn: () => apiGet("/web/genders"),
    staleTime: 10 * 60 * 3600 * 24, // 24 hours
  });

  const navItems = React.useMemo(
    () => gendersData?.result || [],
    [gendersData],
  );

  if (pathname?.startsWith(`${localePrefix}/dashboard`)) {
    return <NavbarDashboard />;
  }

  if (gendersError) {
    console.error(gendersError);
  }

  const activeGender = currentGender || navItems[0]?.name.en;

  // Get user initials
  const getUserInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky bg-white top-0 z-50 h-fit w-full bg-transparent transition-colors duration-150 hover:bg-white shadow-sm lg:block hidden">
      <div className="flex relative py-3 justify-between navbar-container mx-auto items-center">
        <Link
          className=" flex items-center"
          href={`${localePrefix}/${activeGender}`}
        >
          <div className="flex items-center absolute ">
            <div className={`${currentLocale === "ar" ? "rotate-180" : ""}  `}>
              <Image
                src="/images/banner2.png"
                alt="banner2"
                width={20}
                height={20}
              />
            </div>

            {/* glass banner */}
            <div
              className={`-mx-5 ${currentLocale === "ar" ? "rotate-180" : ""} `}
            >
              <Image
                src="/images/glass-banner2.png"
                alt="glass banner2"
                width={25}
                height={25}
              />
            </div>
          </div>
          <div className="w-56 mx-7">
            <Image
              src="/images/logo/velvet-logo-typo-big.svg"
              alt="Velvet Logo"
              width={500}
              height={500}
              priority
            />
          </div>
        </Link>

        {!gendersLoading && (
          <div className="flex gap-x-3">
            {navItems.map((item) => (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setHoveredCategory(item.name.en)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link href={`${localePrefix}/${item.name.en}`}>
                  <p
                    className={` text-sm rounded w-full px-8 cursor-pointer py-1 ${
                      activeGender === item.name.en
                        ? "font-bold bg-black text-white"
                        : "font-light text-[#000000]"
                    }`}
                  >
                    {currentLocale === "ar" ? item.name.ar : item.name.en}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}

        {gendersLoading && (
          <div className="flex gap-x-5">
            <span className="bg-gray-300 w-20 h-4 rounded-lg animate-pulse"></span>
            <span className="bg-gray-300 w-20 h-4 rounded-lg animate-pulse"></span>
            <span className="bg-gray-300 w-20 h-4 rounded-lg animate-pulse"></span>
            <span className="bg-gray-300 w-20 h-4 rounded-lg animate-pulse"></span>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-x-3">
          <Suspense>
            <LanguageSwitcher />
          </Suspense>

          {/* Search Icon */}
          <Link
            href={`${localePrefix}/${encodeURIComponent(activeGender)}/search`}
            className="hover:opacity-70 transition-opacity"
          >
            <Image
              src="/images/search.svg"
              alt="Search"
              width={28}
              height={28}
            />
          </Link>

          <div className="relative">
            {!isAuthenticated ? (
              <Link href={`${localePrefix}/login`}>
                <button className="flex items-center bg-black cursor-pointer text-white px-5 py-2 text-sm font-bold hover:bg-gray-800 transition-all">
                  {t("login")}
                </button>
              </Link>
            ) : (
              <div className="relative flex items-center gap-3">
                {/* Welcome Message with Avatar */}
                <div className="flex items-center gap-3 pr-3 border-r border-gray-200">
                  <div className="relative group">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-3 hover:bg-gray-50 rounded-full pl-1 pr-3 py-1 transition-all duration-200"
                    >
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white font-bold text-sm ring-2 ring-offset-2 ring-gray-200 hover:ring-black transition-all duration-200">
                        {getUserInitials()}
                      </div>

                      {/* User Info */}
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-gray-500 font-medium">
                          {t("welcome")}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 leading-none">
                          {user?.name || "User"}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-slate-100 shadow-xl rounded-2xl py-2 z-20 overflow-hidden">
                      {/* User Info Header */}
                      <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white font-bold text-lg ring-2 ring-gray-200">
                            {getUserInitials()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user?.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <Link
                        href={`${localePrefix}/dashboard/profile`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <IoIosSettings className="text-lg text-slate-600" />
                        </div>
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        href={`${localePrefix}/dashboard/favorite`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-slate-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </div>
                        <span>Wishlist</span>
                      </Link>

                      <Link
                        href={`${localePrefix}/cart`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-slate-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </div>
                        <span>Cart</span>
                        {cartCount > 0 && (
                          <span className="ml-auto bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {cartCount}
                          </span>
                        )}
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-50"
                      >
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                          <IoIosLogOut className="text-lg text-red-500" />
                        </div>
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <Link
            href={`${localePrefix}/dashboard/favorite`}
            className="hover:opacity-70 transition-opacity"
          >
            <Image
              src="/images/heart.svg"
              alt="Wishlist"
              width={20}
              height={20}
            />
          </Link>

          {/* Notifications Bell */}
          <NotificationsBell />

          <div
            onMouseEnter={() => setCartOpen(true)}
            onMouseLeave={() => setCartOpen(false)}
            className="relative"
          >
            <Image
              src="/images/bag.svg"
              alt="Cart"
              width={20}
              height={20}
              className="cursor-pointer hover:opacity-70 transition-opacity"
            />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <CartMenu isOpen={cartOpen} onClose={() => setCartOpen(false)} />
          </div>
        </div>
      </div>

      <CategoryDropdown
        hoveredCategory={hoveredCategory}
        activeGender={activeGender}
        locale={currentLocale}
        onMouseEnter={() => setHoveredCategory(hoveredCategory)}
        onMouseLeave={() => setHoveredCategory(null)}
      />
    </header>
  );
}

export default NavBar;
