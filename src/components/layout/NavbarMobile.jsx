"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, usePathname } from "next/navigation";
import { IoIosArrowForward } from "react-icons/io";
import { getGenderFromPathname, getLocalePrefix } from "@/lib/locale";
import { FaBars, FaTimes } from "react-icons/fa";
import { MdArrowForwardIos } from "react-icons/md";
import CategoryDropdownMobile from "./CategoryDropdownMobile";
import LanguageSwitcher from "./LanguageSwitcher";
import NavbarDashboard from "./Navbar-dashboard";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

function NavbarMobile() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const localePrefix = getLocalePrefix(pathname);
  const currentGender = getGenderFromPathname(pathname, searchParams);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // dynamic object where each gender value can be toggled open/closed
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedMobileCategory, setSelectedMobileCategory] = useState(null);

  const {
    data: gendersData,
    isLoading: gendersLoading,
    error: gendersError,
  } = useQuery({
    queryKey: ["genders-web"],
    queryFn: () => apiGet("/genders-web"),
    staleTime: 10 * 60 * 3600 * 24, // 24 hours
  });

  const navItems = gendersData?.result || [];

  const activeGender = currentGender || navItems[0]?.name || "Female";

  const iconButtons = [
    {
      src: "/images/search.svg",
      alt: "Search",
      width: "1.5rem",
      height: "1.5rem",
      marginTop: "-mt-[0.4rem]",
      href: `${localePrefix}/${encodeURIComponent(activeGender)}/search`,
    },
    {
      src: "/images/person.svg",
      alt: "Profile",
      width: "1.2rem",
      height: "1.2rem",
    },
    {
      src: "/images/heart.svg",
      alt: "Wishlist",
      width: "1.2rem",
      height: "1.2rem",
      href: `${localePrefix}/dashboard/favorite`,
    },
    { src: "/images/bag.svg", alt: "Cart", width: "1.2rem", height: "1.2rem" },
  ];

  const IconImage = ({ src, alt, width, height, marginTop }) => (
    <Image
      src={src}
      alt={alt}
      width={0}
      height={0}
      style={{ width, height }}
      className={`cursor-pointer ${marginTop || ""}`}
    />
  );

  const isCategoryBold = (itemValue) => {
    if (!currentGender) {
      return itemValue === navItems[0]?.name;
    }
    return currentGender === itemValue;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    if (!isMobileMenuOpen) {
      setExpandedSections({});
      setSelectedMobileCategory(null);
    }
  };

  const toggleDropdown = (value) => {
    setExpandedSections((prev) => ({
      ...prev,
      [value]: !prev[value],
    }));

    if (selectedMobileCategory === value) {
      setSelectedMobileCategory(null);
    } else {
      setSelectedMobileCategory(value);
    }
  };

  const handleNavigation = () => {
    setIsMobileMenuOpen(false);
    setSelectedMobileCategory(null);
  };

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isMobileMenuOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [isMobileMenuOpen]);

  if (gendersLoading) {
    return null; // or a spinner while genders load
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
          href={`${localePrefix}/${activeGender.en}`}
          onClick={() => setIsMobileMenuOpen(false)}
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
        <div className="py-4 px-6 border-b border-gray-200">
          <div className="flex gap-x-4">
            {iconButtons.map((icon, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center"
              >
                {icon.href ? (
                  <Link href={icon.href} className="p-1">
                    <IconImage {...icon} />
                  </Link>
                ) : (
                  <IconImage {...icon} />
                )}
                <span className="text-xs text-gray-600 mt-1">{icon.alt}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col py-4">
          {/* Navigation Items */}
          {navItems.map((item) => (
            <div key={item.id} className="border-b border-gray-200">
              <div
                className={`flex justify-between items-center py-4 px-6 text-[#000000] text-[1rem] cursor-pointer ${
                  isCategoryBold(item.value) ? "font-bold" : "font-light"
                }`}
                onClick={() => toggleDropdown(item.value)}
              >
                <span>{item.label}</span>
                <MdArrowForwardIos
                  className={`text-[#333333] text-[0.9rem] transition-transform duration-300 ${
                    expandedSections[item.value] ? "rotate-90" : "rotate-0"
                  }`}
                />
              </div>

              {/* Mobile Category Dropdown - Use CategoryDropdownMobile here */}
              {expandedSections[item.value] && (
                <div className="px-4 pb-4">
                  <CategoryDropdownMobile
                    isOpen={expandedSections[item.value]}
                    onClose={() => {
                      setExpandedSections((prev) => ({
                        ...prev,
                        [item.value]: false,
                      }));
                      setSelectedMobileCategory(null);
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Action Icons in Mobile Menu */}
        </div>
      </div>
    </div>
  );
}

export default NavbarMobile;
