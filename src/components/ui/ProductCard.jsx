"use client";
import { getLocalePrefix } from "@/lib/locale";
import LottieAnimationPlayer from "@/loader/LottieAnimationPlayer";
import NextImage from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { FaHeart, FaRegHeart } from "react-icons/fa"; // Added react-icons

function ProductCard({ item, isMini }) {
  console.log("ProductCard", item);
  const t = useTranslations("cart");
  const pathname = usePathname();
  const localePrefix = getLocalePrefix(pathname);
  const [isLoading, setIsLoading] = useState(true);
  const isBundle = item?.type === 'bundle' || item?.is_bundle === true;

  // Fixed dimensions in rem
  const imageWidth = isMini ? "md:10rem 20rem" : "20rem"; // 10rem = 160px, 20rem = 320px
  const imageHeight = isMini ? "md:10rem 20rem" : "26.67rem"; // 10rem = 160px, 20rem = 320px

  // Helper function to get display price
  const getDisplayPrice = () => {
    if (item?.discount?.has_discount && item.discount.category_discount_details) {
      return item.discount.category_discount_details.discounted_price.formatted;
    }
    return item?.price?.formatted || `${item?.price?.symbol}${item?.price?.amount}`;
  };

  // Helper function to get original price (for strikethrough)
  const getOriginalPrice = () => {
    if (item?.discount?.has_discount && item.discount.category_discount_details) {
      return item.discount.category_discount_details.original_price.formatted;
    }
    return null;
  };

  // Helper function to get bundle original price
  const getBundleOriginalPrice = () => {
    if (isBundle && item.original_price) {
      return item.original_price.formatted || `${item.original_price.symbol}${item.original_price.amount}`;
    }
    return null;
  };

  // Helper function to get discount label (e.g., "20% OFF")
  const getDiscountLabel = () => {
    if (item?.discount?.has_discount) {
      if (item.discount.type === "category_percentage" && item.discount.category_discount_details?.label) {
        return item.discount.category_discount_details.label;
      }
    }
    return null;
  };

  const displayPrice = getDisplayPrice();
  const originalPrice = getOriginalPrice();
  const bundleOriginalPrice = getBundleOriginalPrice();
  const discountLabel = getDiscountLabel();

  return (
    <div className="relative cursor-pointer flex flex-col items-start justify-center group h-full w-full">
      <Link
        href={`${localePrefix}/product/${item.id}`}
        className="relative overflow-hidden w-full"
      >
        <div
          className={`relative w-full overflow-hidden ${isMini ? "aspect-1" : "aspect-3/4"}`}
          style={{
            width: imageWidth,
            height: imageHeight,
            maxWidth: "100%",
          }}
        >
          {/* loader overlay */}
          <div
            className={`absolute size-full inset-0 flex items-center justify-center bg-gray-200 transition-opacity duration-300 ${
              isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <LottieAnimationPlayer />
          </div>

          {/* Bundle Tag */}
          {isBundle && (
            <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
              {t("bundle")}
            </div>
          )}

          {/* Favorite Heart Icon Overlay */}
          <div className="absolute bottom-3 right-3 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md flex items-center justify-center">
            {item?.is_favorite ? (
              <FaHeart className="text-red-500 text-xl" />
            ) : (
              <FaRegHeart className="text-black text-xl" />
            )}
          </div>

          <NextImage
            fill
            src={item.images?.[0] || "/images/600x800.png"}
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            alt={item.name || "product"}
            sizes={`(max-width: 768px) 100vw, ${isMini ? "10rem" : "20rem"}`}
            onLoad={() => {
              setIsLoading(false);
            }}
          />

          {!isBundle && (
            <div
              className={`${isMini ? "px-4 text-xs" : "px-10 text-sm"} absolute flex flex-col gap-y-3 items-center justify-center translate-y-full group-hover:translate-y-0 transition-all duration-200 bg-white/50 backdrop-blur-xs w-full h-20 bottom-0 z-10`}
            >
              <h6 className="text-sm">Size</h6>
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-around w-full font-medium"
              >
                {item?.available_colors[0]?.available_sizes?.map((size) => (
                  <span
                    className="transition-colors duration-150 py-1 px-2 hover:backdrop-blur-2xl hover:bg-white/50"
                    key={size.id}
                  >
                    {size.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Link>

      {!isMini && (
        <div className="pt-3 text-base w-full">
          <h2 className="truncate">{item.name}</h2>
          <div className="flex items-center justify-between w-full mt-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-base">{displayPrice}</p>
              {originalPrice && (
                <p className="text-sm text-[#333333] line-through">{originalPrice}</p>
              )}
            </div>

            {/* Discount Badge matching your screenshot layout */}
            {discountLabel && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                {discountLabel}
              </span>
            )}
          </div>

          {isBundle && bundleOriginalPrice && (
            <p className="text-sm text-[#333333] line-through">{bundleOriginalPrice}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductCard;