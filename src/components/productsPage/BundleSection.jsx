"use client";
import Image from "next/image";
import Line from "../ui/line";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa6";

const BundleSection = ({
  product,
  t,
  activeColor,
  selectedColor,
  setSelectedColor,
  bundleSelections,
  updateBundleSelection,
  getChildSizesForColor,
  isAddedToCart,
  handleAddToCart,
  handleToggleFavorite,
  isPending,
  getColorBtnClass,
  getAddBtnClass,
  getChildColorBtnClass,
  getChildSizeBtnClass,
  showBundleSavings,
  bundleSavingsAmount,
  isAddingToCart, // New prop
}) => {
  return (
    <div className="space-y-4">
      {/* Bundle Header — Name, Pricing, Savings */}
      <div className="mb-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-bold text-[#000000] text-[1.2rem]">
            {product.bundle_price?.formatted || product.price?.formatted}
          </h1>
          {product.original_price && (
            <>
              <span className="text-sm text-gray-500 line-through">
                {product.original_price.formatted}
              </span>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                {t("bundle_deal")}
              </span>
            </>
          )}
          {showBundleSavings && (
            <p className="text-xs text-green-600 mt-1 w-full">
              {t("you_save", { amount: bundleSavingsAmount })}
            </p>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {t("bundle_of", { count: product.bundles?.length || 0 })}
        </p>
      </div>

      {/* Bundle's own color selector */}
      {product.available_colors?.length > 0 && (
        <div>
          <h1 className="font-bold text-[#000000] text-[0.9rem] mb-2">
            {t("bundle_color")}
          </h1>
          <div className="flex flex-wrap gap-3">
            {product.available_colors.map((color) => (
              <button
                key={color.id}
                onClick={() => { setSelectedColor(color); setSelectedSize(null); }}
                className={getColorBtnClass(color.id)}
                style={{ backgroundColor: color.hex_code || color.color_code }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Child Items — Color & Size Selection Per Item */}
      <div className="mt-4">
        <h1 className="font-bold text-[#000000] text-[0.95rem] mb-3">
          {t("items_in_bundle")}
        </h1>
        {product.bundles?.map((child, index) => (
          <BundleChildItem
            key={child.id}
            child={child}
            index={index}
            selection={bundleSelections[index]}
            childSizes={getChildSizesForColor(child, bundleSelections[index]?.colorId)}
            t={t}
            updateBundleSelection={updateBundleSelection}
            getChildColorBtnClass={getChildColorBtnClass}
            getChildSizeBtnClass={getChildSizeBtnClass}
          />
        ))}
      </div>

      <Line mt="mt-4" />

      {/* Add to Cart + Wishlist */}
      <div className="flex gap-x-[0.8rem] w-full">
        <div className="w-[80%]">
          <button
            onClick={handleAddToCart}
            disabled={isAddedToCart || isAddingToCart}
            className={getAddBtnClass(isAddedToCart)}
          >
            {isAddingToCart ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>{t("adding_to_cart")}</span>
              </div>
            ) : isAddedToCart ? (
              t("added_to_cart")
            ) : (
              t("add_bundle_to_cart")
            )}
          </button>
        </div>
        <div className="w-[20%]">
          <button
            onClick={handleToggleFavorite}
            className="w-full h-[3.8rem] bg-[#000000] flex justify-center items-center cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50"
            disabled={isPending}
            aria-label={product.is_favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <div className="w-[2.3rem] h-[2.3rem] relative flex items-center justify-center">
              {product.is_favorite ? (
                <FaHeart className="text-red-500 text-3xl" />
              ) : (
                <CiHeart className="text-white text-3xl" />
              )}
            </div>
          </button>
        </div>
      </div>

      <Line mt="mt-7" />
    </div>
  );
};

// Sub-component for each child item in the bundle
const BundleChildItem = ({
  child,
  index,
  selection,
  childSizes,
  t,
  updateBundleSelection,
  getChildColorBtnClass,
  getChildSizeBtnClass,
}) => (
  <div className="border border-[#E6E6E6] rounded-lg p-4 mb-3">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-16 h-20 relative overflow-hidden rounded bg-gray-100 shrink-0">
        <Image
          src={child.images?.[0] || child.primary_color?.main_image || "/images/600x800.png"}
          alt={child.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div>
        <h4 className="font-semibold text-[#000000] text-sm">{child.name}</h4>
        <p className="text-xs text-gray-500">{child.price?.formatted}</p>
      </div>
    </div>

    {/* Child Color Selection */}
    {child.available_colors?.length > 0 && (
      <div className="mb-3">
        <p className="text-[0.8rem] font-semibold text-[#333333] mb-1">
          {t("color_for", { name: child.name })}
        </p>
        <div className="flex flex-wrap gap-2">
          {child.available_colors.map((color) => (
            <button
              key={color.id}
              onClick={() => updateBundleSelection(index, "colorId", color.id)}
              className={getChildColorBtnClass(color.id, selection?.colorId)}
              style={{ backgroundColor: color.hex_code }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    )}

    {/* Child Size Selection */}
    {selection?.colorId && childSizes.length > 0 && (
      <div>
        <p className="text-[0.8rem] font-semibold text-[#333333] mb-1">
          {t("size_for", { name: child.name })}
        </p>
        <div className="flex flex-wrap gap-2">
          {childSizes.map((size) => (
            <button
              key={size.id}
              onClick={() => updateBundleSelection(index, "sizeId", size.id)}
              disabled={!size.in_stock}
              className={getChildSizeBtnClass(size, selection?.sizeId)}
            >
              {size.name}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* Empty state if color selected but no sizes */}
    {selection?.colorId && childSizes.length === 0 && (
      <p className="text-xs text-gray-400 mt-1">
        {t("no_sizes")}
      </p>
    )}
  </div>
);

export default BundleSection;