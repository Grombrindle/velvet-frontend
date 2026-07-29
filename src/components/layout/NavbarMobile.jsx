"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { getGenderFromPathname, getLocalePrefix } from "@/lib/locale";
import { FaBars, FaTimes } from "react-icons/fa";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { IoIosLogOut, IoIosSettings } from "react-icons/io";
import CategoryDropdownMobile from "./CategoryDropdownMobile";
import LanguageSwitcher from "./LanguageSwitcher";
import NavbarDashboard from "./Navbar-dashboard";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useCart } from "@/components/cart/hooks/useCart";
import { useLocale, useTranslations } from "next-intl";

function NavbarMobile() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const localePrefix = getLocalePrefix(pathname);
  const currentGender = getGenderFromPathname(pathname, searchParams);
  const currentLocale = useLocale();
  const t = useTranslations("navbar");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedMobileCategory, setSelectedMobileCategory] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, isAuthenticated, clear } = useAuthStore();
  const { data: cart } = useCart({ enabled: isAuthenticated });
  const cartCount = cart?.totalCount || 0;

  const {
    data: gendersData,
    isLoading: gendersLoading,
    error: gendersError,
  } = useQuery({
    queryKey: ["genders-web"],
    queryFn: () => apiGet("/web/genders"),
    staleTime: 10 * 60 * 3600 * 24, // 24 hours
  });

  const navItems = gendersData?.result || [];

  const activeGender = currentGender || navItems[0]?.name?.en || "Female";

  const isCategoryBold = (itemValue) => {
    if (!currentGender) {
      return itemValue === navItems[0]?.name?.en;
    }
    return currentGender === itemValue;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    if (!isMobileMenuOpen) {
      setExpandedSections({});
      setSelectedMobileCategory(null);
      setUserMenuOpen(false);
    }
  };

  const toggleDropdown = (genderValue) => {
    setExpandedSections((prev) => ({
      ...prev,
      [genderValue]: !prev[genderValue],
    }));

    if (selectedMobileCategory === genderValue) {
      setSelectedMobileCategory(null);
    } else {
      setSelectedMobileCategory(genderValue);
    }
  };

  const handleNavigation = () => {
    setIsMobileMenuOpen(false);
    setSelectedMobileCategory(null);
    setUserMenuOpen(false);
    setExpandedSections({});
  };

  const handleLogout = () => {
    clear();
    setUserMenuOpen(false);
    handleNavigation();
    router.push(`${localePrefix}/login`);
  };

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isMobileMenuOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [isMobileMenuOpen]);

  if (gendersLoading) {
    return null;
  }
  if (gendersError) {
    console.error(gendersError);
  }

  if (pathname?.startsWith(`${localePrefix}/dashboard`)) {
    return <NavbarDashboard />;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full lg:hidden">
      {/* Header */}
      <div className="flex justify-between items-center h-16 px-4 bg-white shadow-md">
        {/* Logo */}
        <Link
          href={`${localePrefix}/${activeGender}`}
          onClick={handleNavigation}
        >
          <div className="w-36">
            <Image
              src="/images/logo/velvet-logo-typo-big.svg"
              alt="Velvet Logo"
              width={150}
              height={40}
              className="w-full h-auto"
            />
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />

          {/* Menu Toggle Button */}
          <button
            onClick={toggleMobileMenu}
            className="text-2xl text-[#333333]"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-16 bg-black/50"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`fixed h-full top-16 right-0 bottom-0 w-full bg-white shadow-lg transition-transform duration-300 ease-in overflow-y-auto ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Welcome Section - Shows when authenticated */}
        {isAuthenticated && (
          <div className="py-4 px-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("welcome")}</p>
                <p className="font-bold text-[#000000] text-base">
                  {user?.name || "User"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Top Action Icons */}
        <div className="py-4 px-6 border-b border-gray-200">
          <div className="flex gap-x-6">
            {/* Search Icon */}
            <Link
              href={`${localePrefix}/${encodeURIComponent(activeGender)}/search`}
              onClick={handleNavigation}
              className="flex flex-col items-center justify-center group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors flex items-center justify-center">
                <Image
                  src="/images/search.svg"
                  alt="Search"
                  width={22}
                  height={22}
                  className="cursor-pointer"
                />
              </div>
              <span className="text-xs text-gray-600 mt-1">Search</span>
            </Link>

            {/* Profile/Login */}
            {!isAuthenticated ? (
              <Link
                href={`${localePrefix}/login`}
                onClick={handleNavigation}
                className="flex flex-col items-center justify-center group"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <Image
                    src="/images/person.svg"
                    alt="Profile"
                    width={20}
                    height={20}
                    className="cursor-pointer"
                  />
                </div>
                <span className="text-xs text-gray-600 mt-1">Login</span>
              </Link>
            ) : (
              <div className="relative flex flex-col items-center">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex flex-col items-center group"
                >
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                    <span className="text-white font-bold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 mt-1">Profile</span>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div
                      className={`absolute ${
                        currentLocale == "en" ? "left-0" : "right-0"
                      } mt-12 w-56 bg-white border border-slate-100 shadow-xl rounded-2xl py-2 z-20 overflow-hidden`}
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        href={`${localePrefix}/dashboard/profile`}
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleNavigation();
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <IoIosSettings className="text-lg text-slate-400" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-50"
                      >
                        <IoIosLogOut className="text-lg" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Wishlist */}
            <Link
              href={`${localePrefix}/dashboard/favorite`}
              onClick={handleNavigation}
              className="flex flex-col items-center justify-center group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors flex items-center justify-center">
                <Image
                  src="/images/heart.svg"
                  alt="Wishlist"
                  width={20}
                  height={20}
                  className="cursor-pointer"
                />
              </div>
              <span className="text-xs text-gray-600 mt-1">Wishlist</span>
            </Link>

            {/* Cart */}
            <Link
              href={`${localePrefix}/cart`}
              onClick={handleNavigation}
              className="flex flex-col items-center justify-center group relative"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <Image
                    src="/images/bag.svg"
                    alt="Cart"
                    width={20}
                    height={20}
                    className="cursor-pointer"
                  />
                </div>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-600 mt-1">Cart</span>
            </Link>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col py-4">
          {navItems.map((item) => (
            <div key={item.id} className="border-b border-gray-200">
              <div
                className={`flex justify-between items-center py-4 px-6 text-[#000000] text-[1rem] cursor-pointer transition-colors hover:bg-gray-50 ${
                  isCategoryBold(item.name?.en) ? "font-bold" : "font-light"
                }`}
                onClick={() => toggleDropdown(item.name?.en)}
              >
                <span>
                  {currentLocale === "ar" ? item.name?.ar : item.name?.en}
                </span>
                {currentLocale === "en" ? (
                  <MdArrowForwardIos
                    className={`text-[#333333] text-[0.9rem] transition-transform duration-300 ${
                      expandedSections[item.name?.en] ? "rotate-90" : "rotate-0"
                    }`}
                  />
                ) : (
                  <MdArrowBackIos
                    className={`text-[#333333] text-[0.9rem] transition-transform duration-300 ${
                      expandedSections[item.name?.en] ? "rotate-90" : "rotate-0"
                    }`}
                  />
                )}
              </div>

              {/* Mobile Category Dropdown */}
              {expandedSections[item.name?.en] && (
                <div className="px-4 pb-4">
                  <CategoryDropdownMobile
                    isOpen={expandedSections[item.name?.en]}
                    onClose={() => {
                      setExpandedSections((prev) => ({
                        ...prev,
                        [item.name?.en]: false,
                      }));
                      setSelectedMobileCategory(null);
                    }}
                    handleNavigation={handleNavigation}
                    activeGender={item.name?.en}
                    localePrefix={localePrefix}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NavbarMobile;
