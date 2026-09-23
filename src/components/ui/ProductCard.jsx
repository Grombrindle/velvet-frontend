"use client";
import { getLocalePrefix } from "@/lib/locale";
import LottieAnimationPlayer from "@/loader/LottieAnimationPlayer";
import NextImage from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useFavoriteStore, useAuthStore } from "@/lib/store"; // Import auth store
import { toast } from "react-hot-toast";
import { useToggleFavorite } from "../productsPage/hook/favourite";
import LoginPopup from "../auth/loginPopup"; // Import LoginPopup

function ProductCard({ item, isMini }) {
  const t = useTranslations("product");
  const pathname = usePathname();
  const localePrefix = getLocalePrefix(pathname);
  const [isLoading, setIsLoading] = useState(true);
  const isBundle = item?.type === "bundle" || item?.is_bundle === true;

  // Auth state
  const { isAuthenticated } = useAuthStore();

  // Login popup state
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Favorite functionality
  const { mutate: toggleFavoriteApi, isPending } = useToggleFavorite();
  const {
    isFavorite,
    setFavorite,
    toggleFavorite: toggleFavoriteStore,
  } = useFavoriteStore();
  const productId = item?.id;

  // Get current favorite state from store or item
  const currentFavoriteState =
    isFavorite(productId) || item?.is_favorite || false;

  // Fixed dimensions in rem
  const imageWidth = isMini ? "md:10rem 20rem" : "20rem";
  const imageHeight = isMini ? "md:10rem 20rem" : "26.67rem";

  // Helper function to get display price
  const getDisplayPrice = () => {
    if (
      item?.discount?.has_discount &&
      item.discount.category_discount_details
    ) {
      return item.discount.category_discount_details.discounted_price.formatted;
    }
    return (
      item?.price?.formatted || `${item?.price?.symbol}${item?.price?.amount}`
    );
  };

  // Helper function to get original price (for strikethrough)
  const getOriginalPrice = () => {
    if (
      item?.discount?.has_discount &&
      item.discount.category_discount_details
    ) {
      return item.discount.category_discount_details.original_price.formatted;
    }
    return null;
  };

  // Helper function to get bundle original price
  const getBundleOriginalPrice = () => {
    if (isBundle && item.original_price) {
      return (
        item.original_price.formatted ||
        `${item.original_price.symbol}${item.original_price.amount}`
      );
    }
    return null;
  };

  // Helper function to get discount label
  const getDiscountLabel = () => {
    if (item?.discount?.has_discount) {
      if (
        item.discount.type === "category_percentage" &&
        item.discount.category_discount_details?.label
      ) {
        return item.discount.category_discount_details.label;
      }
    }
    return null;
  };

  // Handle favorite toggle with authentication check
  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!productId) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      setPendingAction("favorite");
      setShowLoginPopup(true);
      return;
    }

    const newFavoriteState = !currentFavoriteState;

    // Optimistic update
    toast.success(
      newFavoriteState ? t("favorite_added") : t("favorite_removed"),
    );
    toggleFavoriteStore(productId);

    // Call API
    toggleFavoriteApi(productId, {
      onError: (error) => {
        // Revert on error
        setFavorite(productId, currentFavoriteState);
        toast.error(t("favorite_error"));
      },
      onSuccess: (data) => {
        // Sync with API response
        if (data?.is_favorite !== undefined) {
          setFavorite(productId, data.is_favorite);
        }
      },
    });
  };

  const displayPrice = getDisplayPrice();
  const originalPrice = getOriginalPrice();
  const bundleOriginalPrice = getBundleOriginalPrice();
  const discountLabel = getDiscountLabel();

  return (
    <>
      {/* Login Popup */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        action={pendingAction}
      />

      <div className="relative cursor-pointer flex flex-col items-start justify-center group h-full w-full">
        <Link
          href={`${localePrefix}/product/${item.id}`}
          className="relative overflow-hidden w-full"
          onClick={(e) => {
            // If the click target is the heart button, prevent navigation
            if (e.target.closest(".favorite-button")) {
              e.preventDefault();
            }
          }}
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

            {/* Favorite Heart Icon Overlay - with stopPropagation */}
            {/* Favorite Heart Icon Overlay - only show when authenticated */}
            {/* Favorite Heart Icon Overlay */}
            <div
              className="absolute bottom-3 right-3 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md flex items-center justify-center favorite-button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <button
                onClick={handleToggleFavorite}
                disabled={isPending}
                className="favorite-button"
                aria-label={
                  currentFavoriteState
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                {isAuthenticated && currentFavoriteState ? (
                  <FaHeart className="text-red-500 text-xl" />
                ) : (
                  <FaRegHeart className="text-black text-xl" />
                )}
              </button>
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
                  <p className="text-sm text-[#333333] line-through">
                    {originalPrice}
                  </p>
                )}
              </div>

              {/* Discount Badge matching your screenshot layout */}
              {discountLabel && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                  {discountLabel.replace("OFF", t("off"))}
                </span>
              )}
            </div>

            {isBundle && bundleOriginalPrice && (
              <p className="text-sm text-[#333333] line-through">
                {bundleOriginalPrice}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default ProductCard;
