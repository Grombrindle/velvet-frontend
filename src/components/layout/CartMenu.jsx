"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getLocalePrefix } from "@/lib/locale";
import { useCart, useRemoveCartItem } from "@/components/cart/hooks/useCart";
import { useAuthStore } from "@/lib/store";
import { useLocale, useTranslations } from "next-intl";

const CartMenu = ({ isOpen, onClose }) => {
  const t = useTranslations("cart");
  const locale = useLocale();
  const pathname = usePathname();
  const localePrefix = getLocalePrefix(pathname);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: cart } = useCart({ enabled: isAuthenticated });
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();
  const items = cart?.items || [];
  const totalCount = cart?.totalCount || 0;
  const subtotalFormatted = cart?.subtotalFormatted || cart?.totalFormatted || "0";
  const totalFormatted = cart?.totalFormatted || "0";
  const router = useRouter();
  const isRtl = locale === "ar";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: isRtl ? -50 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRtl ? -50 : 50 }}
          transition={{ duration: 0.3 }}
          className={`absolute top-0 w-100 h-160 bg-white shadow-2xl z-50 flex flex-col ${
            isRtl ? "left-0" : "right-0"
          }`}
        >
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-lg font-semibold">{t("myBag")}</h2>
            <span className="text-gray-500 text-sm">
              {t("itemsCount", { count: totalCount })}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y">
            {items.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                {t("emptyBag")}
              </div>
            ) : (
              items.map((item) => {
                const isBundle = item.type === 'bundle' || item.isBundle === true;
                return (
                  <div key={item.cartItemId || item.id} className="flex gap-4 p-4 items-center">
                    <div className="w-24 h-32 relative shrink-0">
                      <Image
                        src={item.image || "/images/600x800.png"}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <div className="font-semibold text-base mb-1">
                            {item.name}
                            {isBundle && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                                {t("bundle")}
                              </span>
                            )}
                          </div>
                          <div className="text-xs mb-1">
                            <span className="font-bold">{t("quantity")}:</span>{" "}
                            {item.quantity}
                          </div>
                          {!isBundle && (
                            <>
                              <div className="text-xs mb-1">
                                <span className="font-bold">{t("color")}:</span>{" "}
                                {item.color || "-"}
                              </div>
                              <div className="text-xs mb-1">
                                <span className="font-bold">{t("size")}:</span> {item.size || "-"}
                              </div>
                            </>
                          )}
                          {isBundle && (
                            <div className="text-xs text-gray-500">
                              {item.bundleItems?.length || 0} {t("items").toLowerCase()}
                            </div>
                          )}
                          <div className="font-bold text-xs mt-2">
                            {item.total?.formatted || item.price?.formatted}
                          </div>
                        </div>

                        <button
                          className="ml-2 text-gray-400 hover:text-black text-lg disabled:opacity-50"
                          onClick={() => removeItem(item.id)}
                          disabled={isRemoving}
                          aria-label={t("removeItem")}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t p-6">
            <div className="flex justify-between mb-2 text-gray-700">
              <span>{t("subtotal", { count: totalCount })}</span>
              <span>{subtotalFormatted}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-sm">{t("total")}</span>
              <span className="font-bold text-lg">{totalFormatted}</span>
            </div>
            <button
              className="w-full bg-black text-white py-3 font-bold text-base rounded mb-2 transition hover:bg-gray-800 disabled:opacity-50"
              onClick={() => {
                if (items.length === 0) return;
                onClose();
                router.push(`${localePrefix}/checkout`);
              }}
              disabled={items.length === 0}
            >
              {t("checkout")}
            </button>
            <Link
              href={`${localePrefix}/cart`}
              onClick={onClose}
              className="block text-center underline text-black text-xs font-semibold"
            >
              {t("viewBag")}
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartMenu;
