"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";

export default function LocaleQueryInvalidator() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!locale) return;
    queryClient.invalidateQueries();
  }, [locale, queryClient]);

  return null;
}
