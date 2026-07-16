"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { supportedLocales } from "@/lib/locale";
import Image from "next/image";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const labels = {
  en: { lang: "English", code: "EN" },

  ar: { lang: "العربية", code: "AR" },
};

function buildLocalePath(pathname, searchParams, targetLocale) {
  const segments = pathname.split("/").filter(Boolean);
  const hasLocale = supportedLocales.includes(segments[0]);
  const rest = hasLocale ? segments.slice(1) : segments;
  const path = `/${targetLocale}${rest.length ? `/${rest.join("/")}` : ""}`;
  const search = searchParams.toString();
  return search ? `${path}?${search}` : path;
}

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("language");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative inline-block text-left">
      <div
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="cursor-pointer flex items-center gap-2 text-sm font-semibold text-slate-700  transition duration-200"
      >
        <Image
          src="/images/lang_icon.svg"
          alt="English"
          width={20}
          height={20}
        />
        <span className="flex items-center justify-center rounded-full mt-1 font-bold text-slate-700 transition duration-200">
          {labels[locale].code}
        </span>
        {locale === "ar" && (
          <IoIosArrowBack
            className={` ${open ? "-rotate-90" : "rotate-0"} transition-all duration-200`}
            size={16}
          />
        )}
        {locale === "en" && (
          <IoIosArrowForward
            className={` ${open ? "rotate-90" : "rotate-0"} transition-all duration-200`}
            size={16}
          />
        )}
      </div>

      <div
        className={`absolute right-1/2 translate-x-1/2 z-50 mt-2 w-max origin-top-right overflow-hidden rounded-3xl bg-white  ring-1 ring-slate-200 transition-all duration-200 ${
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-1 p-2">
          {supportedLocales.map((targetLocale) => (
            <Link
              key={targetLocale}
              href={buildLocalePath(pathname, searchParams, targetLocale)}
              onClick={() => setOpen(false)}
              className={`text-sm text-center rounded-2xl px-3 py-2 transition-colors duration-150 ${
                locale === targetLocale
                  ? "bg-black text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {labels[targetLocale].lang}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
