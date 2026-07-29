"use client";
import Image from "next/image";
import React from "react";
import { useTranslations } from "next-intl";

function BundleCartItem({ item, onRemove, onQuantityChange, disabled = false, readOnly = false }) {
  const t = useTranslations("cart");

  return (
    <div className="border-2 border-blue-100 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
      {/* Bundle Parent Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="w-full sm:w-32 md:w-40 h-40 sm:h-44 md:h-50 shrink-0 relative rounded-lg overflow-hidden bg-gray-100 border border-[#E6E6E6] mx-auto sm:mx-0">
          <Image
            src={item.image || "/images/600x800.png"}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 160px"
          />
        </div>
        
        <div className="flex-1 flex flex-col justify-between min-h-[160px] sm:min-h-[180px] md:min-h-[200px]">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-lg md:text-[20px] font-bold leading-tight">
                {item.bundleName || item.name}
              </span>
              <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold whitespace-nowrap">
                {t("bundle")}
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
              {t("bundle_items")}: {item.bundleItems?.length || 0}
            </p>
            
            <div className="text-sm sm:text-[15px] font-semibold mt-0.5 sm:mt-1">
              <span className="text-black/70">{t("color")}:</span> {item.color || "-"}
            </div>
            
            <div className="text-sm sm:text-[15px] font-semibold">
              <span className="text-black/70">{t("size")}:</span> {item.size || "-"}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 sm:mt-4">
            {!readOnly && (
              <select
                className="border border-[#E6E6E6] rounded px-2 py-1 w-14 sm:w-16 text-center text-sm sm:text-[15px] font-medium"
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
            
            <div className="text-right flex-1 sm:flex-none">
              <div className="font-bold text-base sm:text-[18px] tracking-tight">
                {item.total?.formatted || item.price?.formatted}
              </div>
              {item.bundlePrice && item.price?.amount !== item.bundlePrice?.amount && (
                <div className="text-[10px] sm:text-xs text-green-600">
                  {t("bundle_price")}: {item.bundlePrice.formatted}
                </div>
              )}
            </div>
            
            {!readOnly && (
              <button
                className="text-2xl sm:text-[28px] text-black/40 hover:text-black/80 px-1 sm:px-2 disabled:opacity-50"
                onClick={onRemove}
                disabled={disabled}
                aria-label={t("removeItem")}
                style={{ fontWeight: 600, lineHeight: "1" }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bundle Children List */}
      {item.bundleItems?.length > 0 && (
        <div className="ml-0 sm:ml-4 mt-3 sm:mt-4 border-t pt-3 sm:pt-4 space-y-2 sm:space-y-3">
          <p className="text-[10px] sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {t("includes")}
          </p>
          
          {item.bundleItems.map((child) => (
            <div key={child.cartItemId || child.id} className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 sm:w-12 h-14 sm:h-16 relative overflow-hidden rounded bg-gray-100 shrink-0">
                <Image
                  src={child.image || "/images/600x800.png"}
                  alt={child.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs sm:text-sm truncate">{child.name}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                  {child.color}, {child.size}
                </p>
              </div>
              
              <span className="text-[10px] sm:text-xs text-green-600 font-medium whitespace-nowrap">
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