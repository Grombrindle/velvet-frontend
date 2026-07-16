"use client";
import React, { Suspense, useState } from "react";
import Image from "next/image";
import { IoIosLogOut, IoIosSettings } from "react-icons/io";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import CategoryDropdown from "./CategoryDropdown";
import CartMenu from "./CartMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuthStore } from "@/lib/store";
import NavbarDashboard from "./Navbar-dashboard";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import {
  getGenderFromPathname,
  getLocalePrefix,
} from "@/lib/locale";
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

          {isAuthenticated && (
            <p className="text-sm">
              {t("welcome")} <b>{user?.name}</b>
            </p>
          )}

          {/* Search Icon */}
          <Link
            href={`${localePrefix}/${encodeURIComponent(activeGender)}/search`}
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
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <Image
                    src="/images/person.svg"
                    alt="Profile"
                    width={20}
                    height={20}
                  />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-2xl py-2 z-20 overflow-hidden">
                      <Link
                        href={`${localePrefix}/dashboard/profile`}
                        onClick={() => setUserMenuOpen(false)}
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
          </div>

          <Link href={`${localePrefix}/dashboard/favorite`}>
            <Image
              src="/images/heart.svg"
              alt="Wishlist"
              width={20}
              height={20}
            />
          </Link>

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
              className="cursor-pointer"
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
