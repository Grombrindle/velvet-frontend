"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useLocale, useTranslations } from "next-intl";
import { getLocalePrefix } from "@/lib/locale";
import Link from "next/link";

const TextLink = ({ children, href }) => (
  <Link
    href={href || "#"}
    className="text-[#000000] font-normal text-[0.85rem] hover:underline block"
  >
    {children}
  </Link>
);

const SectionTitle = ({ children }) => (
  <h1 className="text-[#000000] font-bold text-[0.9rem]">{children}</h1>
);

const CategoryItem = ({ children, href }) => (
  <Link
    href={href || "#"}
    className="text-[#000000] font-[400] text-[0.8rem] hover:underline block"
  >
    {children}
  </Link>
);

const SocialMediaIcon = ({ icon, alt, href }) => (
  <Link href={href || "#"} target="_blank" rel="noopener noreferrer">
    <Image
      src={icon}
      alt={alt}
      width={34}
      height={34}
      className="cursor-pointer hover:opacity-70 transition-opacity"
    />
  </Link>
);

const AppStoreIcon = ({ src, alt, href }) => (
  <Link href={href || "#"} target="_blank" rel="noopener noreferrer">
    <Image
      src={src}
      alt={alt}
      width={80}
      height={80}
      className="cursor-pointer hover:opacity-70 transition-opacity"
    />
  </Link>
);

function Footer() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("footer");
  const localePrefix = getLocalePrefix(pathname);

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  // Fetch genders data
  const {
    data: gendersData,
    isLoading: gendersLoading,
    error: gendersError,
  } = useQuery({
    queryKey: ["genders-web"],
    queryFn: () => apiGet("/web/genders"),
    staleTime: 10 * 60 * 3600 * 24,
  });

  const genders = gendersData?.result || [];

  // Fetch categories for each gender
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["footer-categories", genders.map((g) => g.name.en).join(",")],
    queryFn: async () => {
      if (!genders.length) return {};

      const limitedGenders = genders.slice(0, 3);
      const categoryPromises = limitedGenders.map((gender) =>
        apiGet(`/web/categories-products/${gender.name.en}`),
      );
      const results = await Promise.all(categoryPromises);

      return results.reduce((acc, result, index) => {
        const genderName = limitedGenders[index].name.en;
        acc[genderName] = result?.result?.categories || [];
        return acc;
      }, {});
    },
    enabled: genders.length > 0,
    staleTime: 10 * 60 * 3600 * 24,
  });

  // Get all categories flattened with unique keys
  const allCategories = React.useMemo(() => {
    if (!categoriesData) return [];
    const flat = [];
    const usedKeys = new Set();

    Object.entries(categoriesData).forEach(([gender, categories]) => {
      const genderObj = genders.find((g) => g.name.en === gender);
      const genderLabel = genderObj?.name[locale] || gender;

      categories.forEach((cat) => {
        const uniqueKey = `${gender}-${cat.id}`;

        if (!usedKeys.has(uniqueKey)) {
          usedKeys.add(uniqueKey);
          flat.push({
            ...cat,
            gender: gender,
            genderLabel: genderLabel,
            uniqueKey: uniqueKey,
          });
        }
      });
    });

    return flat;
  }, [categoriesData, genders, locale]);

  const APP_STORES = [
    {
      src: "/images/app-store.png",
      alt: "app-store",
      href: "https://apps.apple.com/app/velvet",
    },
    {
      src: "/images/google-play.png",
      alt: "google-play",
      href: "https://play.google.com/store/apps/details?id=com.velvet",
    },
  ];

  const getGenderName = (gender) => {
    return locale === "ar" ? gender.name.ar : gender.name.en;
  };

  const isLoading = gendersLoading || categoriesLoading;

  // Define footer links with locale prefix
  const footerLinks = [
    { 
      label: locale === "ar" ? "الأسئلة الشائعة" : "FAQ", 
      href: `/${locale}/dashboard/faq` 
    },
    { 
      label: locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy", 
      href: `/${locale}/dashboard/privacy-policy` 
    },
  ];

  // Split categories into two halves
  const halfCount = Math.ceil(allCategories.length / 2);
  const firstHalfCategories = allCategories.slice(0, halfCount);
  const secondHalfCategories = allCategories.slice(halfCount);

  return (
    <div>
      {/* Top Section - App Download */}
      <div className="w-full mx-auto lg:h-[23rem] mt-[3rem] py-[3rem] bg-[#F4F4F4]">
        <div className="flex justify-center text-center items-center flex-col">
          <h1 className="text-[#000000] text-[0.9rem]">{t("Download_App")}</h1>
          <p className="text-[#000000] lg:px-0 px-[1rem] text-[0.9rem] font-light">
            {t("Discover_app")}{" "}
          </p>
          <div className="flex gap-x-2 mt-3">
            {APP_STORES.map((store, index) => (
              <AppStoreIcon
                key={index}
                src={store.src}
                alt={store.alt}
                href={store.href}
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="container1 mx-auto">
          <div className="grid lg:grid-cols-12 lg:gap-y-0 gap-y-[2rem] grid-cols-1 gap-x-[1rem] mt-[1rem]">
            {/* Left Section - Genders */}
            <div className="lg:col-span-6 col-span-1">
              <div className="grid grid-cols-2 gap-4">
                {isLoading ? (
                  <>
                    <div>
                      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div>
                      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div>
                      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </>
                ) : (
                  genders.slice(0, 3).map((gender) => (
                    <div key={gender.id}>
                      <SectionTitle>{getGenderName(gender)}</SectionTitle>
                      {categoriesData?.[gender.name.en]
                        ?.slice(0, 6)
                        .map((category) => (
                          <TextLink
                            key={`${gender.id}-${category.id}`}
                            href={`/${locale}/${gender.name.en}/category/${category.id}`}
                          >
                            {category.name}
                          </TextLink>
                        ))}
                    </div>
                  ))
                )}
                {gendersError && (
                  <div className="text-red-500 text-sm col-span-3">
                    {locale === "ar"
                      ? "حدث خطأ في تحميل البيانات"
                      : "Error loading data"}
                  </div>
                )}
              </div>
            </div>

            {/* Middle Section - All Categories & FAQ/Privacy */}
            <div className="lg:col-span-6 col-span-1">
              <div className="grid lg:grid-cols-3 grid-cols-2 gap-4">
                {/* Categories Column 1 - First Half */}
                <div>
                  <SectionTitle>
                    {locale === "ar" ? "جميع الفئات" : "All Categories"}
                  </SectionTitle>
                  {isLoading
                    ? Array(8)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            key={i}
                            className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"
                          ></div>
                        ))
                    : firstHalfCategories.map((category) => (
                        <CategoryItem
                          key={category.uniqueKey}
                          href={`/${locale}/${category.gender}/category/${category.id}`}
                        >
                          {category.name}
                        </CategoryItem>
                      ))}
                </div>

                {/* Categories Column 2 - Second Half */}
                <div>
                  {isLoading
                    ? Array(8)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            key={i}
                            className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"
                          ></div>
                        ))
                    : secondHalfCategories.map((category) => (
                        <CategoryItem
                          key={category.uniqueKey}
                          href={`/${locale}/${category.gender}/category/${category.id}`}
                        >
                          {category.name}
                        </CategoryItem>
                      ))}
                </div>

                {/* Column 3 - FAQ & Privacy Policy */}
                <div>
                  <SectionTitle>
                    {locale === "ar" ? "معلومات" : "Information"}
                  </SectionTitle>
                  {footerLinks.map((link, index) => (
                    <TextLink key={index} href={link.href}>
                      {link.label}
                    </TextLink>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Icons - Moved below */}
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="w-full h-[3rem] flex justify-center items-center bg-[#000000]">
        <p className="text-white text-[0.8rem]">@ Copyright 2025 Velvet.com</p>
      </div>
    </div>
  );
}

export default Footer;