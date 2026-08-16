"use client";
import Image from "next/image";
import { CiHeart } from "react-icons/ci";
import { useEffect, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import Line from "../ui/line";
import { useAddToCart, useToggleFavorite } from "./hook/favourite";
import { toast } from "react-hot-toast";
import { FaHeart } from "react-icons/fa6";
import { useFavoriteStore } from "@/lib/store";
import { useLocale, useTranslations } from "next-intl";
import BundleSection from "./BundleSection";
import { usePaymentMethods } from "./hook/usePaymentMethod";
import { useDeliveryMethods } from "./hook/useDeliveryOption";

const ProductsDetails = ({ productData: initialProductData }) => {
  const t = useTranslations("product");
  const locale = useLocale();

  // Get product ID
  const productId = initialProductData?.result?.id || initialProductData?.id;
  const baseProduct = initialProductData?.result || initialProductData;

  // Use favorite store
  const {
    isFavorite,
    setFavorite,
    toggleFavorite: toggleFavoriteStore,
  } = useFavoriteStore();

  // Sync API favorite state with store on mount and when API data changes
  useEffect(() => {
    if (baseProduct?.is_favorite !== undefined) {
      const currentFavorite = isFavorite(productId);
      if (currentFavorite !== baseProduct.is_favorite) {
        setFavorite(productId, baseProduct.is_favorite);
      }
    }
  }, [baseProduct?.is_favorite, productId, setFavorite, isFavorite]);

  const { mutate: toggleFavoriteApi, isPending } = useToggleFavorite();
  const { mutate: addToCart } = useAddToCart();

  // Fetch payment methods
  const { data: paymentMethods = [], isLoading: isPaymentMethodsLoading } =
    usePaymentMethods();

  // Fetch delivery methods
  const { data: deliveryMethods = [], isLoading: isDeliveryMethodsLoading } =
    useDeliveryMethods();

  const [favoriteOverride, setFavoriteOverride] = useState(null);
  const [selectedColor, setSelectedColor] = useState(() => {
    const baseIsBundle =
      baseProduct?.type === "bundle" || baseProduct?.is_bundle === true;
    return baseIsBundle ? baseProduct?.available_colors?.[0] || null : null;
  });
  const [selectedSize, setSelectedSize] = useState(null);
  const [addedSelectionKey, setAddedSelectionKey] = useState(null);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const [isPaymentMethodsOpen, setIsPaymentMethodsOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  
  // Local loading state for add to cart
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Use API is_favorite first, then store, with override taking precedence
  const product = {
    ...baseProduct,
    is_favorite: favoriteOverride !== null 
      ? favoriteOverride 
      : (baseProduct?.is_favorite || isFavorite(productId) || false),
  };
  
  const isBundle = product?.type === "bundle" || product?.is_bundle === true;
  const activeColor = selectedColor || product?.available_colors?.[0] || null;
  const selectionKey = `${activeColor?.id || ""}-${selectedSize?.id || ""}`;
  const isAddedToCart = addedSelectionKey === selectionKey;
  const showBundleSavings =
    isBundle &&
    product.original_price &&
    product.bundle_price &&
    product.original_price.amount > product.bundle_price.amount;
  const bundleSavingsAmount = showBundleSavings
    ? (product.original_price.amount - product.bundle_price.amount).toFixed(2) +
      " SP"
    : null;

  // Bundle selections state — one entry per child item (lazy init from props)
  const [bundleSelections, setBundleSelections] = useState(() => {
    const baseIsBundle =
      baseProduct?.type === "bundle" || baseProduct?.is_bundle === true;
    if (baseIsBundle && baseProduct.bundles?.length) {
      return baseProduct.bundles.map((child) => ({
        productId: child.id,
        colorId: child.available_colors?.[0]?.id || null,
        sizeId: null,
      }));
    }
    return [];
  });

  // Helper: update a specific child's color or size selection
  const updateBundleSelection = (index, field, value) => {
    setBundleSelections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      // Reset size on color change
      if (field === "colorId") next[index].sizeId = null;
      return next;
    });
    // Reset "Added To Cart" when bundle selections change
    setAddedSelectionKey(null);
  };

  // Handle color change (resets size and "Added To Cart")
  const handleColorChange = (color) => {
    setSelectedColor(color);
    setSelectedSize(null);
    setAddedSelectionKey(null);
  };

  // Handle size change (resets "Added To Cart")
  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setAddedSelectionKey(null);
  };

  // Helper: get available sizes for a child item given its selected color
  const getChildSizesForColor = (child, colorId) => {
    const color = child.available_colors?.find((c) => c.id === colorId);
    return color?.available_sizes || [];
  };

  // === Computed ClassNames ===
  const getSizeBtnClass = (size) => {
    const isSelected = selectedSize?.id === size.id;
    let cls =
      "w-full h-[3.8rem] border flex justify-center items-center transition-all duration-200";
    cls += isSelected
      ? " border-black bg-black text-white"
      : " border-[#D4D4D4] hover:border-gray-400";
    if (!size.in_stock) cls += " opacity-50 cursor-not-allowed bg-gray-100";
    return cls;
  };

  const getAddBtnClass = (added) => {
    let cls =
      "w-full h-[3.8rem] font-bold text-md transition-colors disabled:cursor-not-allowed";
    cls += added
      ? " bg-[#D9F99D] text-[#14532D]"
      : " bg-[#000000] text-white cursor-pointer hover:bg-gray-800";
    return cls;
  };

  const getColorBtnClass = (colorId) => {
    const isActive = activeColor?.id === colorId;
    let cls = "w-[1.8rem] h-[1.8rem] relative cursor-pointer overflow-hidden";
    cls += isActive
      ? " border-black border-2 ring-black ring-offset-2"
      : " border-gray-300";
    return cls;
  };

  const getChildColorBtnClass = (colorId, currentSel) => {
    const isActive = currentSel === colorId;
    let cls = "w-[1.5rem] h-[1.5rem] rounded-full border-2";
    cls += isActive
      ? " border-black ring-2 ring-offset-1 ring-black"
      : " border-gray-300";
    return cls;
  };

  const getChildSizeBtnClass = (size, currentSel) => {
    const isSelected = currentSel === size.id;
    let cls = "px-3 py-1.5 border text-sm rounded";
    if (isSelected) {
      cls += " bg-black text-white border-black";
    } else if (size.in_stock) {
      cls += " border-[#D4D4D4] hover:border-gray-400 text-[#333333]";
    } else {
      cls += " border-gray-100 text-gray-300 cursor-not-allowed";
    }
    return cls;
  };

  const getDropdownChevronClass = (isOpen) => {
    let cls = "text-[1.4rem] transition-transform duration-300";
    if (isOpen) cls += " rotate-90";
    return cls;
  };

  const getDropdownContentClass = (isOpen) => {
    let cls = "overflow-hidden transition-all duration-300";
    cls += isOpen ? " max-h-96 opacity-100" : " max-h-0 opacity-0";
    return cls;
  };

  // Dispatch color change event when selectedColor changes
  useEffect(() => {
    if (activeColor) {
      const event = new CustomEvent("colorChanged", { detail: activeColor });
      window.dispatchEvent(event);
    }
  }, [activeColor]);

  if (!product) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{t("product_not_found")}</p>
      </div>
    );
  }

  // Get available sizes from selected color
  const availableSizes = activeColor?.available_sizes || [];

  const handleToggleFavorite = () => {
    // Get current favorite state from the product (which uses API data)
    const currentFavoriteState = product.is_favorite;
    const newFavoriteState = !currentFavoriteState;

    // Show optimistic toast
    const action = newFavoriteState
      ? t("favorite_added")
      : t("favorite_removed");
    toast.success(action);
    
    // Set override for optimistic UI
    setFavoriteOverride(newFavoriteState);

    // Update store first (optimistic update)
    toggleFavoriteStore(productId);

    // Call the API mutation
    toggleFavoriteApi(product.id, {
      onError: (error) => {
        // Revert on error
        setFavoriteOverride(currentFavoriteState);
        // Revert store
        setFavorite(productId, currentFavoriteState);
        toast.error(t("favorite_error"));
        console.error("Failed to toggle favorite:", error);
      },
      onSuccess: (data) => {
        // If API returns success but with different value, sync it
        if (
          data?.is_favorite !== undefined &&
          data.is_favorite !== newFavoriteState
        ) {
          setFavoriteOverride(data.is_favorite);
          setFavorite(productId, data.is_favorite);
        }
      },
    });
  };

  // Helper function to render price with discount
  const renderPrice = () => {
    const hasDiscount = product.discount?.has_discount;
    const discountDetails = product.discount?.category_discount_details;

    if (hasDiscount && discountDetails) {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-bold text-[#000000] text-[1.2rem]">
              {discountDetails.discounted_price.formatted}
            </h1>
            <span className="text-sm text-gray-500 line-through">
              {discountDetails.original_price.formatted}
            </span>
            <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded">
              {discountDetails.label}
            </span>
          </div>
          <p className="text-xs text-green-600">
            {t("you_save", { amount: discountDetails.savings.formatted })}
          </p>
        </div>
      );
    }

    return (
      <h1 className="font-bold text-[#000000] text-[1.2rem]">
        {product.price?.formatted ||
          `${product.price?.amount} ${product.price?.currency_code}`}
        <span className="text-sm text-gray-500 font-normal ml-2">
          ({product.price?.currency_code})
        </span>
      </h1>
    );
  };

  const getCartPricePayload = () => {
    const discountDetails = product.discount?.category_discount_details;

    if (product.discount?.has_discount && discountDetails?.discounted_price) {
      return discountDetails.discounted_price;
    }

    return product.price;
  };

  const getCartImage = () => {
    return (
      activeColor?.images?.[0] ||
      product.primary_color?.images?.[0] ||
      product.images?.[0] ||
      "/images/600x800.png"
    );
  };

 const handleAddToCart = () => {
  // Show loader immediately
  setIsAddingToCart(true);

  if (isBundle) {
    // Validate bundle's own color
    if (!activeColor) {
      toast.error(t("select_bundle_color"));
      setIsAddingToCart(false);
      return;
    }

    const bundleSize =
      activeColor?.available_sizes?.find((s) => s.in_stock) ||
      activeColor?.available_sizes?.[0] ||
      null;

    if (!bundleSize) {
      toast.error(t("select_bundle_size"));
      setIsAddingToCart(false);
      return;
    }

    for (let i = 0; i < bundleSelections.length; i++) {
      const sel = bundleSelections[i];
      const childName =
        product.bundles?.[i]?.name || t("item_number", { number: i + 1 });
      if (!sel.colorId) {
        toast.error(t("select_color_for", { name: childName }));
        setIsAddingToCart(false);
        return;
      }
      if (!sel.sizeId) {
        toast.error(t("select_size_for", { name: childName }));
        setIsAddingToCart(false);
        return;
      }
    }

    setAddedSelectionKey(selectionKey);

    const colors_id = [
      activeColor.id,
      ...bundleSelections.map((s) => s.colorId),
    ];
    const sizes_id = [
      bundleSize.id,
      ...bundleSelections.map((s) => s.sizeId),
    ];

    const bundlePrice = product.bundle_price || product.price;

    addToCart(
      {
        product_id: product.id,
        quantity: 1,
        colors_id,
        sizes_id,
        product_name: product.name,
        image: getCartImage(),
        price: bundlePrice,
        currency: bundlePrice?.currency_code,
        color_name: activeColor.name,
        size_name: bundleSize.name,
      },
      {
        onSuccess: () => {
          setIsAddingToCart(false);
          // ✅ Add success toast here
          toast.success(
            locale === "en"
              ? "Bundle added to cart successfully!"
              : "تم إضافة الباقة إلى السلة بنجاح!"
          );
        },
        onError: (error) => {
          setAddedSelectionKey(null);
          setIsAddingToCart(false);
          // ✅ Add error toast here
          toast.error(
            locale === "en"
              ? error?.response?.message || "Failed to add bundle to cart"
              : error?.response?.message || "فشل إضافة الباقة إلى السلة"
          );
        },
      },
    );

    return;
  }

  // === Standard (non-bundle) add-to-cart ===
  if (!activeColor) {
    toast.error(t("select_color"));
    setIsAddingToCart(false);
    return;
  }

  if (!selectedSize) {
    toast.error(t("select_size"));
    setIsAddingToCart(false);
    return;
  }

  setAddedSelectionKey(selectionKey);
  const cartPrice = getCartPricePayload();

  addToCart(
    {
      product_id: product.id,
      quantity: 1,
      colors_id: [activeColor.id],
      sizes_id: [selectedSize.id],
      product_name: product.name,
      image: getCartImage(),
      price: cartPrice,
      currency: cartPrice?.currency_code,
      color_name: activeColor.name,
      size_name: selectedSize.name,
    },
    {
      onSuccess: () => {
        setIsAddingToCart(false);
        // ✅ Add success toast here
        toast.success(
          locale === "en"
            ? "Item added to cart successfully!"
            : "تم إضافة المنتج إلى السلة بنجاح!"
        );
      },
      onError: (error) => {
        setAddedSelectionKey(null);
        setIsAddingToCart(false);
        // ✅ Add error toast here
        toast.error(
          locale === "en"
            ? error?.response?.message || "Failed to add item to cart"
            : error?.response?.message || "فشل إضافة المنتج إلى السلة"
        );
      },
    },
  );
};

  return (
    <div className="lg:pl-[2.3rem] relative">
      <div className="flex flex-col lg:space-y-6 space-y-4 lg:mt-0 mt-[1rem]">
        <h1 className="font-bold text-[0.95rem] text-[#000000]">
          {product.name}
        </h1>

        {/* ===== BUNDLE UI ===== */}
        {isBundle ? (
          <BundleSection
            product={product}
            t={t}
            activeColor={activeColor}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            bundleSelections={bundleSelections}
            updateBundleSelection={updateBundleSelection}
            getChildSizesForColor={getChildSizesForColor}
            isAddedToCart={isAddedToCart}
            handleAddToCart={handleAddToCart}
            handleToggleFavorite={handleToggleFavorite}
            isPending={isPending}
            getColorBtnClass={getColorBtnClass}
            getAddBtnClass={getAddBtnClass}
            getChildColorBtnClass={getChildColorBtnClass}
            getChildSizeBtnClass={getChildSizeBtnClass}
            showBundleSavings={showBundleSavings}
            bundleSavingsAmount={bundleSavingsAmount}
            isAddingToCart={isAddingToCart}
          />
        ) : (
          /* ===== STANDARD (NON-BUNDLE) UI ===== */
          <div className="non-bundle-content">
            <div className="space-y-2">
              {renderPrice()}

              {product.discount?.has_discount && (
                <p className="font-bold text-[0.9rem] text-[#EB5757]">
                  {product.discount.type === "category_percentage"
                    ? (product.discount.category_discount_details?.percentage ||
                        "") + "% OFF ON THIS CATEGORY"
                    : product.discount.buy_x_get_y_details?.label ||
                      t("special_offer")}
                </p>
              )}

              <p className="text-[0.8rem] text-[#333333]">
                {t("product_code")}: {product.sku || product.id} | {t("color")}:{" "}
                {activeColor?.name || product.primary_color?.name}
              </p>

              {/* Color Selection */}
              {product.available_colors &&
                product.available_colors.length > 0 && (
                  <div className="mt-3">
                    <h1 className="font-bold text-[#000000] text-[0.9rem] mb-2">
                      {t("available_colors")}
                    </h1>
                    <div className="flex flex-wrap gap-3">
                      {product.available_colors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => handleColorChange(color)}
                          className={getColorBtnClass(color.id)}
                          style={{
                            backgroundColor: color.hex_code || color.color_code,
                          }}
                          title={color.name}
                          aria-label={t("select_color_label", {
                            color: color.name,
                          })}
                        />
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Size Selection */}
            <div>
              <h1 className="font-bold text-[#000000] text-[0.9rem]">
                {t("size")}
              </h1>
              <Line mt="mt-2" />

              {availableSizes.length > 0 ? (
                <div className="grid grid-cols-5 gap-x-[0.9rem] gap-y-[1.2rem] mt-3">
                  {availableSizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => handleSizeChange(size)}
                      disabled={!size.in_stock}
                      className={getSizeBtnClass(size)}
                    >
                      <p className="text-sm font-normal">{size.name}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  {t("no_sizes_available")}
                </p>
              )}

              <Line mt="mt-[2rem]" />

              {/* Add to Cart and Wishlist Buttons */}
              <div className="flex gap-x-[0.8rem] w-full mt-4">
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
                      t("added_to_cart_success")
                    ) : (
                      t("add_to_cart")
                    )}
                  </button>
                </div>
                <div className="w-[20%]">
                  <button
                    onClick={handleToggleFavorite}
                    className="w-full h-[3.8rem] bg-[#000000] flex justify-center items-center cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50"
                    disabled={isPending}
                    aria-label={
                      product.is_favorite
                        ? t("remove_from_favorites")
                        : t("add_to_favorites")
                    }
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
          </div>
        )}

        {/* Product Details Dropdown */}
        <div className="space-y-1">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsProductDetailsOpen(!isProductDetailsOpen)}
          >
            <h1 className="font-bold text-[#000000] text-[0.95rem] mt-3">
              {t("product_detail")}
            </h1>
            <div className={getDropdownChevronClass(isProductDetailsOpen)}>
              {locale == "en" ? (
                <MdKeyboardArrowRight />
              ) : (
                <MdKeyboardArrowLeft />
              )}
            </div>
          </div>

          {/* Dropdown Content */}
          <div className={getDropdownContentClass(isProductDetailsOpen)}>
            <p className="text-[#000000] font-light text-[0.8rem] mt-2">
              {product.description || t("no_description")}
            </p>

            {/* Specifications from API */}
            {product.specifications?.map((spec, index) => (
              <div key={index}>
                <h1 className="text-[0.9rem] font-bold text-[#000000] mt-2">
                  {spec.name}:
                  <span className="text-[0.8rem] font-light ml-1">
                    {Array.isArray(spec.values)
                      ? spec.values.join(", ")
                      : spec.values}
                  </span>
                </h1>
              </div>
            ))}

            {product.gender && (
              <h1 className="text-[0.9rem] font-bold text-[#000000] mt-2">
                {t("gender")}:
                <span className="text-[0.8rem] font-light ml-1 capitalize">
                  {product.gender}
                </span>
              </h1>
            )}
          </div>
          <Line mt="mt-4" />
        </div>

        {/* Delivery Options Dropdown - Dynamic from API */}
        <div className="space-y-1">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
          >
            <h1 className="font-bold text-[#000000] text-[0.95rem] mt-3">
              {t("delivery_options")}
            </h1>
            <div className={getDropdownChevronClass(isDeliveryOpen)}>
              {locale == "en" ? (
                <MdKeyboardArrowRight />
              ) : (
                <MdKeyboardArrowLeft />
              )}
            </div>
          </div>

          {/* Dropdown Content - Dynamic from API */}
          <div className={getDropdownContentClass(isDeliveryOpen)}>
            {isDeliveryMethodsLoading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : deliveryMethods.length > 0 ? (
              <div className="mt-2 space-y-2">
                {deliveryMethods.map((method) => (
                  <div
                    key={method.id || method.name}
                    className="border-b border-gray-100 pb-2 last:border-0"
                  >
                    <div className="flex items-start gap-2">
                      {method.image && (
                        <div className="relative w-8 h-8 flex-shrink-0 mt-1">
                          <Image
                            src={method.image}
                            alt={
                              method.name ||
                              method.method_name ||
                              t("delivery_method")
                            }
                            fill
                            className="object-contain"
                            sizes="32px"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-[0.85rem] text-[#000000]">
                          {method.name ||
                            method.method_name ||
                            t("delivery_method")}
                        </p>
                        {method.description && (
                          <p className="text-[0.8rem] text-[#666666]">
                            {method.description}
                          </p>
                        )}
                        {method.estimated_time && (
                          <p className="text-[0.75rem] text-[#888888] mt-0.5">
                            {t("estimated")}: {method.estimated_time}
                          </p>
                        )}
                        {method.price && (
                          <p className="text-[0.8rem] font-medium text-[#000000] mt-0.5">
                            {typeof method.price === "object"
                              ? method.price.formatted ||
                                `${method.price.amount} ${method.price.currency_code}`
                              : method.price}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                {t("no_delivery_methods")}
              </p>
            )}
          </div>
          <Line mt="mt-4" />
        </div>

        {/* Payment Methods Dropdown - Using API Data */}
        <div className="space-y-1">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsPaymentMethodsOpen(!isPaymentMethodsOpen)}
          >
            <h1 className="font-bold text-[#000000] text-[0.95rem] mt-3">
              {t("payment_methods")}
            </h1>
            <div className={getDropdownChevronClass(isPaymentMethodsOpen)}>
              {locale == "en" ? (
                <MdKeyboardArrowRight />
              ) : (
                <MdKeyboardArrowLeft />
              )}
            </div>
          </div>

          {/* Dropdown Content - Dynamic from API */}
          <div className={getDropdownContentClass(isPaymentMethodsOpen)}>
            <p className="text-[0.9rem] text-[#333333] mt-2">
              {t("payment_digital_options")}
            </p>

            {isPaymentMethodsLoading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : paymentMethods.length > 0 ? (
              <div className="flex flex-wrap gap-4 mt-3 mb-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id || method.name}
                    className="flex-1 min-w-[80px] h-16 bg-gray-100 rounded-lg flex items-center justify-center p-2 border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    {method.image ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={method.image}
                          alt={
                            method.name ||
                            method.method_name ||
                            t("payment_method")
                          }
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-700">
                        {method.name ||
                          method.method_name ||
                          t("payment_method")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                {t("no_payment_methods")}
              </p>
            )}
          </div>
          <Line mt="mt-4" />
        </div>
      </div>
    </div>
  );
};

export default ProductsDetails;