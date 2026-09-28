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
import NotificationsBell from "../notifications/NotificationsBell";
import NavbarDashboard from "./Navbar-dashboard";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useCart } from "@/components/cart/hooks/useCart";
import { useLocale, useTranslations } from "next-intl";
import {
  useChangeCurrency,
  useCurrencies,
} from "../currency/hooks/useCurrencies";
import { toast } from "react-hot-toast";

function NavbarMobile() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const localePrefix = getLocalePrefix(pathname);
  const currentGender = getGenderFromPathname(pathname, searchParams);
  const currentLocale = useLocale();
  const t = useTranslations("navbar");
  const tCurrencies = useTranslations("currencies");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedMobileCategory, setSelectedMobileCategory] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false); // ✅ State for mobile currency dropdown

  const { user, isAuthenticated, clear } = useAuthStore();
  const { data: cart } = useCart({ enabled: isAuthenticated });
  const cartCount = cart?.totalCount || 0;

  // ✅ Currency hooks
  const { data: currenciesData } = useCurrencies();
  const changeCurrencyMutation = useChangeCurrency();
  const currencies = currenciesData?.currencies || [];
  const currentCurrency = currenciesData?.user_currency;

  const handleCurrencySelect = async (currencyId) => {
    if (currencyId === currentCurrency?.id) {
      setCurrencyMenuOpen(false);
      return;
    }

    try {
      await changeCurrencyMutation.mutateAsync(currencyId);
      toast.success(tCurrencies("currency_changed_successfully!"));
      setCurrencyMenuOpen(false);

      // ✅ Forces full browser refresh so all mobile pages/components instantly update prices
      window.location.reload();
    } catch (error) {
      toast.error(error?.message || tCurrencies("Failed_to_change_currency"));
    }
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
      setCurrencyMenuOpen(false);
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
    setCurrencyMenuOpen(false);
    setExpandedSections({});
  };

  const handleLogout = () => {
    clear();
    setUserMenuOpen(false);
    // Navigate to home with active gender if available
    const homePath = activeGender
      ? `${localePrefix}/${activeGender}`
      : `${localePrefix}/`;
    router.push(homePath);
    window.location.href = homePath;
  };
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isMobileMenuOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [isMobileMenuOpen]);

  if (gendersLoading) {
    return null;
  }
  if (gendersError) {
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
          <div className="w-[8rem]">
            <Image
              src="/images/logo/logo-velvet-edit.png"
              alt="Velvet Logo"
              width={100}
              height={20}
              className="w-full h-auto"
            />
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {/* ✅ Mobile Currency Dropdown Switcher */}
          <div className="relative">
            <button
              onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)}
              className="flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer"
            >
              <span>{currentCurrency?.code || "USD"}</span>
              <span className="text-gray-400">
                ({currentCurrency?.symbol || "$"})
              </span>
            </button>

            {currencyMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setCurrencyMenuOpen(false)}
                />
                <div className={`absolute ${currentLocale == "ar"?' left-0':'right-0'} top-full mt-2 w-36 bg-white border border-slate-100 shadow-xl rounded-xl py-2 z-20`}>
                  <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    {tCurrencies("currency_selection")}
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {currencies.map((currency) => (
                      <button
                        key={currency.id}
                        onClick={() => handleCurrencySelect(currency.id)}
                        className={`w-full ${currentLocale == "en" ? "text-left" : "text-right"} px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors ${
                          currentCurrency?.id === currency.id
                            ? "font-bold bg-gray-50 text-black"
                            : "text-gray-700"
                        }`}
                      >
                        <span>{currency.code}</span>
                        <span className="text-gray-500">{currency.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

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
            {/* Search Icon - Always visible */}
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
            </Link>

            {/* Profile/Login - Always visible */}
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
                <span className="text-xs text-gray-600 mt-1">{t("login")}</span>
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
                        {t("Dashboard")}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-50"
                      >
                        <IoIosLogOut className="text-lg" />
                        {t("Logout")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Wishlist - Only show when authenticated */}
            {isAuthenticated && (
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
              </Link>
            )}

            {/* Notifications Bell - Only show when authenticated */}
            {isAuthenticated && <NotificationsBell variant="mobile" />}

            {/* Cart - Only show when authenticated */}
            {isAuthenticated && (
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
              </Link>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col py-4">
          {navItems.map((item) => {
            const genderName = item.name?.en;
            const displayName =
              currentLocale === "ar" ? item.name?.ar : item.name?.en;
            const isExpanded = !!expandedSections[genderName];

            return (
              <div key={item.id} className="border-b border-gray-200">
                <div
                  className={`flex justify-between items-center py-4 px-6 text-[#000000] text-[1rem] transition-colors hover:bg-gray-50 ${
                    isCategoryBold(genderName) ? "font-bold" : "font-light"
                  }`}
                >
                  <Link
                    href={`${localePrefix}/${encodeURIComponent(genderName)}`}
                    onClick={handleNavigation}
                    className="flex-1"
                  >
                    <span>{displayName}</span>
                  </Link>

                  <div
                    className="cursor-pointer p-2 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown(genderName);
                    }}
                  >
                    {currentLocale === "en" ? (
                      <MdArrowForwardIos
                        className={`text-[#333333] text-[0.9rem] transition-transform duration-300 ${
                          isExpanded ? "rotate-90" : "rotate-0"
                        }`}
                      />
                    ) : (
                      <MdArrowBackIos
                        className={`text-[#333333] text-[0.9rem] transition-transform duration-300 ${
                          isExpanded ? "rotate-90" : "rotate-0"
                        }`}
                      />
                    )}
                  </div>
                </div>

                {/* Mobile Category Dropdown */}
                {isExpanded && (
                  <div className="px-4 pb-4">
                    <CategoryDropdownMobile
                      isOpen={isExpanded}
                      onClose={() => {
                        setExpandedSections((prev) => ({
                          ...prev,
                          [genderName]: false,
                        }));
                        setSelectedMobileCategory(null);
                      }}
                      handleNavigation={handleNavigation}
                      activeGender={genderName}
                      localePrefix={localePrefix}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default NavbarMobile;
