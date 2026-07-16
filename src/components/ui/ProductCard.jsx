"use client";
import { getLocalePrefix } from "@/lib/locale";
import LottieAnimationPlayer from "@/loader/LottieAnimationPlayer";
import NextImage from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useTranslations } from "next-intl";

function ProductCard({ item, isMini }) {
  const t = useTranslations("cart");
  const pathname = usePathname();
  const localePrefix = getLocalePrefix(pathname);
  const [isLoading, setIsLoading] = useState(true);
  const isBundle = item?.type === 'bundle' || item?.is_bundle === true;

  return (
    <div className="relative cursor-pointer flex flex-col items-start justify-center group h-full w-full">
      <div className="absolute px-5 top-0 left-0 w-full flex items-center justify-between h-10 z-10">
        {/* <IoIosAdd
          onClick={() => addItem(item)}
          className="bg-amber-500 rounded-full text-[1.2rem] text-white"
        />
        <IoMdRemove
          onClick={() => removeItem(item.id)}
          className=" text-[1.2rem] bg-pink-500 rounded-full text-white"
        /> */}
      </div>
      <Link
        href={`${localePrefix}/product/${item.id}`}
        className="relative h-full overflow-hidden w-full"
      >
        <div className="relative h-full  w-full overflow-hidden flex items-center">
          <div
            className={`relative h-full ${isMini ? "md:h-64" : "md:h-125  "} aspect-3/4 w-full overflow-hidden`}
          >
            {/* loader overlay */}
            <div
              className={`absolute size-full inset-0 flex items-center justify-center bg-gray-200 transition-opacity duration-300 ${
                isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <LottieAnimationPlayer />
            </div>

            {isBundle && (
              <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                {t("bundle")}
              </div>
            )}
            <NextImage
              fill
              src={item.images?.[0] || "/images/600x800.png"}
              className=" object-cover transition-transform duration-300 group-hover:scale-110"
              alt={item.name || "product"}
              onLoad={() => {
                setIsLoading(false);
              }}
            />
          </div>
          <div
            className={`${isMini ? "px-4 text-xs" : "px-10 text-sm"} absolute flex flex-col gap-y-3 items-center justify-center translate-y-full group-hover:translate-y-0 transition-all duration-200 bg-white/50 backdrop-blur-xs w-full h-20 bottom-0`}
          >
            <h6 className="text-sm">Size</h6>
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-around w-full font-medium"
            >
              {item?.available_colors[0]?.available_sizes?.map((size) => (
                <span
                  className="transition-colors duration-150 py-1 px-2 hover:backdropblur-2xl hover:bg-white/50"
                  key={size.id}
                >
                  {size.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
      {!isMini && (
        <div className="pt-3 px-8 text-base">
          <h2 className="">{item.name}</h2>
          <p className="font-bold text-base">{item.price.amount} SP</p>
          {isBundle && item.original_price && (
            <p className="text-sm text-gray-400 line-through">
              {item.original_price.amount} SP
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductCard;
