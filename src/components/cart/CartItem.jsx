import Image from "next/image";
import React from "react";
import { useTranslations } from "next-intl";

function CartItem({ item, onRemove, onQuantityChange, disabled = false, readOnly = false }) {
  const t = useTranslations("cart");

  return (
    <div className="cart-item flex flex-col sm:flex-row gap-4 sm:gap-6 border-b border-[#E6E6E6] pb-6 sm:pb-8 mb-6 sm:mb-8 last:border-b-0 last:pb-0 last:mb-0">
      <div className="w-full sm:w-32 md:w-40 h-48 sm:h-40 md:h-50 shrink-0 relative rounded-lg overflow-hidden bg-gray-100 border border-[#E6E6E6]">
        <Image
          src={item.image || "/images/600x800.png"}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 128px, 160px"
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-between min-h-[160px] sm:min-h-[200px]">
        <div>
          <div className="text-[1.25rem] sm:text-[1.25rem] md:text-[1.25rem] font-bold mb-1 leading-tight">
            {item.name}
          </div>
          <div className="text-[0.9375rem] font-semibold mb-1">
            <span className="text-black/70">{t("color")}:</span> {item.color || "-"}
          </div>
          <div className="text-[0.9375rem] font-semibold">
            <span className="text-black/70">{t("size")}:</span> {item.size || "-"}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 sm:mt-4 flex-wrap gap-2">
          {!readOnly && (
            <select
              className="border border-[#E6E6E6] rounded px-2 py-1 w-14 sm:w-16 text-center text-[0.9375rem] font-medium"
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
          
          <div className="font-bold text-[1.125rem] tracking-tight ml-auto sm:ml-0">
            {item.total?.formatted || item.price?.formatted}
          </div>
          
          {!readOnly && (
            <button
              className="text-2xl text-black/40 hover:text-black/80 px-2 disabled:opacity-50 ml-auto sm:ml-0"
              onClick={onRemove}
              disabled={disabled}
              aria-label={t("removeItem")}
              style={{ fontWeight: 600, fontSize: "1.75rem", lineHeight: "1" }}
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartItem;