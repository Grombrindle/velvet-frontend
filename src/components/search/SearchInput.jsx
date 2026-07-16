"use client";
import React from "react";
import { useTranslations } from "next-intl";

export default function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder,
}) {
  const t = useTranslations("searchPage");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="w-full flex items-center "
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t("searchPlaceholder")}
        className="w-full px-4 py-3 border  focus:outline-none"
      />
      <button
        type="submit"
        className="bg-black text-white px-4 py-[0.91rem]  text-sm"
      >
        {t("searchButton")}
      </button>
    </form>
  );
}
