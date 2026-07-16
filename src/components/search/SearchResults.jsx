"use client";
import React from "react";
import ProductCard from "@/components/ui/ProductCard";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";

export default function SearchResults({ results = [], isLoading, error }) {
  const t = useTranslations("searchPage");

  if (isLoading) {
    return <div className="p-6">{t("loadingResults")}</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {t("resultsError", { message: error.message || t("failedToLoad") })}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return <div className="p-6">{t("noResultsFound")}</div>;
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {results.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <ProductCard item={item} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
