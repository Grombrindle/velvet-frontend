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
        className="w-full md:text-md text-sm px-4 md:py-3 py-2 border  focus:outline-none"
      />
      <button
        type="submit"
        className="bg-black text-white px-4 md:py-[0.91rem] py-2.5  text-sm"
      >
        {t("searchButton")}
      </button>
    </form>
  );
}
