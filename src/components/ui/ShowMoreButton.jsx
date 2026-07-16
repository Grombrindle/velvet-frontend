"use client";

import { useTranslations } from "next-intl";

function ShowMoreButton() {
  const t = useTranslations("categoriesPage");
  return (
    <button className="bg-black text-white px-16 py-3.5 cursor-pointer font-semibold uppercase">
      {t("show_more")}
    </button>
  );
}

export default ShowMoreButton;
