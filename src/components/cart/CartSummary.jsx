"use client";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

function CartSummary({ totalCount, totalFormatted, onCheckout }) {
  const t = useTranslations("cart");
  const queryClient = useQueryClient();
  const [promo, setPromo] = useState("");

  const { mutate: applyPromo, isPending: isApplyingPromo } = useMutation({
    mutationFn: (code) => apiPost("/cart/promotion-code", { code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setPromo("");
      toast.success("Promotion code applied!");
    },
    onError: (error) => {
      toast.error(error?.response?.message || "Failed to apply promotion code");
    },
  });

  const handleApply = () => {
    if (!promo.trim()) return;
    applyPromo(promo.trim());
  };

  return (
  <div className="cart-summary border rounded-lg p-6 bg-white w-full max-w-[23.125rem]">

      <div className="flex justify-between items-center mb-4">
        <div className="font-bold text-xl">{t("summary")}</div>
        <div className="text-xs font-semibold underline cursor-pointer">
          {t("itemsShort", { count: totalCount })}
        </div>
      </div>
      <div className="flex justify-between mb-4 text-sm">
        <span>{t("sumOfProducts", { count: totalCount })}</span>
        <span>{totalFormatted}</span>
      </div>
      <div className="mb-4">
        <div className="text-sm mb-1">{t("promotionCode")}</div>
        <div className="md:flex gap-2">
          <input
            className="border rounded px-2 py-1 flex-1"
            type="text"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            placeholder=""
          />
          <button
            className="bg-black text-white px-6 py-1 rounded font-bold text-sm disabled:opacity-50 md:mt-0 mt-[1rem]"
            onClick={handleApply}
            disabled={isApplyingPromo || !promo.trim()}
          >
            {isApplyingPromo ? "..." : t("apply")}
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center font-bold text-lg mb-6">
        <span>{t("total")}</span>
        <span>{totalFormatted}</span>
      </div>
      <button
        className="w-full bg-black text-white py-3 rounded font-bold text-lg tracking-wide hover:bg-gray-900 transition"
        onClick={onCheckout}
      >
        {t("checkout")}
      </button>
    </div>
  );
}

export default CartSummary;
