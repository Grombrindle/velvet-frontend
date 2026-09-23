"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";

const COOKIE_KEY = "velvet_cookie_consent";

export default function CookieConsent() {
  const locale = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user already made a choice
    const stored = localStorage.getItem(COOKIE_KEY);
    if (!stored) {
      // Small delay so it doesn't flash on first paint
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (value) => {
    localStorage.setItem(
      COOKIE_KEY,
      JSON.stringify({ value, date: new Date().toISOString() })
    );
    setVisible(false);

    // Optional: fire analytics init only if "all" accepted
    if (value === "all") {
      // initAnalytics();
    }
  };

  if (!visible) return null;

  const isAr = locale === "ar";

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={isAr ? "إشعار ملفات تعريف الارتباط" : "Cookie consent"}
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-200 shadow-2xl"
    >
      <div className="container1 mx-auto px-4 py-4 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6">
        <p className="text-[#000000] text-[0.85rem] leading-relaxed flex-1">
          {isAr
            ? "نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل حركة المرور. يمكنك قبول الكل أو الاكتفاء بالضرورية فقط."
            : "We use cookies to improve your experience and analyze traffic. You can accept all or keep only the essential ones."}{" "}
          <Link
            href={`/${locale}/dashboard/privacy-policy`}
            className="underline font-medium hover:text-gray-700"
          >
            {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
          </Link>
        </p>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handleAccept("essential")}
            className="px-4 py-2 text-[0.8rem] font-medium border border-[#000000] text-[#000000] rounded hover:bg-gray-100 transition-colors"
          >
            {isAr ? "الضرورية فقط" : "Essential only"}
          </button>
          <button
            onClick={() => handleAccept("all")}
            className="px-4 py-2 text-[0.8rem] font-medium bg-[#000000] text-white rounded hover:bg-gray-800 transition-colors"
          >
            {isAr ? "قبول الكل" : "Accept all"}
          </button>
        </div>
      </div>
    </div>
  );
}