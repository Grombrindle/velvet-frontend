"use client";
import Image from "next/image";
import React from "react";
import { useTranslations } from "next-intl";

function BundleCartItem({ item, onRemove, onQuantityChange, disabled = false, readOnly = false }) {
  const t = useTranslations("cart");

  return (
    <div className="border-2 border-blue-100 rounded-lg p-4 mb-4">
      {/* Bundle Parent Header */}
      <div className="flex gap-4">
        <div className="w-40 h-50 shrink-0 relative rounded-lg overflow-hidden bg-gray-100 border border-[#E6E6E6]">
          <Image
            src={item.image || "/images/600x800.png"}
            alt={item.name}
            fill
            className="object-cover"
            sizes="160px"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between min-h-[200px]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[20px] font-bold leading-tight">
                {item.bundleName || item.name}
              </span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
                {t("bundle")}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {t("bundle_items")}: {item.bundleItems?.length || 0}
            </p>
            <div className="text-[15px] font-semibold mt-1">
              <span className="text-black/70">{t("color")}:</span> {item.color || "-"}
            </div>
            <div className="text-[15px] font-semibold">
              <span className="text-black/70">{t("size")}:</span> {item.size || "-"}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            {!readOnly && (
              <select
                className="border border-[#E6E6E6] rounded px-2 py-1 w-16 text-center text-[15px] font-medium"
                value={item.quantity}
                onChange={(e) => onQuantityChange(Number(e.target.value))}
                disabled={disabled}
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            )}
            <div className="text-right">
              <div className="font-bold text-[18px] tracking-tight">
                {item.total?.formatted || item.price?.formatted}
              </div>
              {item.bundlePrice && item.price?.amount !== item.bundlePrice?.amount && (
                <div className="text-xs text-green-600">
                  {t("bundle_price")}: {item.bundlePrice.formatted}
                </div>
              )}
            </div>
            {!readOnly && (
              <button
                className="text-2xl text-black/40 hover:text-black/80 px-2 disabled:opacity-50"
                onClick={onRemove}
                disabled={disabled}
                aria-label={t("removeItem")}
                style={{ fontWeight: 600, fontSize: "28px", lineHeight: "1" }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bundle Children List */}
      {item.bundleItems?.length > 0 && (
        <div className="ml-4 mt-4 border-t pt-4 space-y-3">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {t("includes")}
          </p>
          {item.bundleItems.map((child) => (
            <div key={child.cartItemId || child.id} className="flex items-center gap-3">
              <div className="w-12 h-16 relative overflow-hidden rounded bg-gray-100 shrink-0">
                <Image
                  src={child.image || "/images/600x800.png"}
                  alt={child.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{child.name}</p>
                <p className="text-xs text-gray-500">
                  {child.color}, {child.size}
                </p>
              </div>
              <span className="text-xs text-green-600 font-medium">
                {t("included")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BundleCartItem;
