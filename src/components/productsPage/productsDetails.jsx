"use client";
import Image from "next/image";
import { CiHeart } from "react-icons/ci";
import { useEffect, useState } from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import Sidebar from "./sidebar";
import Line from "../ui/line";
import { useAddToCart, useToggleFavorite } from "./hook/favourite";
import { Toaster, toast } from "react-hot-toast";
import { FaHeart } from "react-icons/fa6";
import { useFavoriteStore } from "@/lib/store";
import { useTranslations } from "next-intl";
import BundleSection from "./BundleSection";

const ProductsDetails = ({ productData: initialProductData }) => {
  const t = useTranslations("product");
  // Get product ID
  const productId = initialProductData?.result?.id || initialProductData?.id;
  const baseProduct = initialProductData?.result || initialProductData;
  
  // Use favorite store
  const { isFavorite, setFavorite, toggleFavorite: toggleFavoriteStore } = useFavoriteStore();

  const { mutate: toggleFavoriteApi, isPending } = useToggleFavorite();
  const { mutate: addToCart } = useAddToCart();

  const [favoriteOverride, setFavoriteOverride] = useState(null);
  const [selectedColor, setSelectedColor] = useState(() => {
    const baseIsBundle = baseProduct?.type === 'bundle' || baseProduct?.is_bundle === true;
    return baseIsBundle ? (baseProduct?.available_colors?.[0] || null) : null;
  });
  const [selectedSize, setSelectedSize] = useState(null);
  const [addedSelectionKey, setAddedSelectionKey] = useState(null);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const [isPaymentMethodsOpen, setIsPaymentMethodsOpen] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(null);
  const product = {
    ...baseProduct,
    is_favorite: favoriteOverride ?? isFavorite(productId),
  };
  const isBundle = product?.type === 'bundle' || product?.is_bundle === true;
  const activeColor = selectedColor || product?.available_colors?.[0] || null;
  const selectionKey = `${activeColor?.id || ""}-${selectedSize?.id || ""}`;
  const isAddedToCart = addedSelectionKey === selectionKey;
  const showBundleSavings = isBundle && product.original_price && product.bundle_price && product.original_price.amount > product.bundle_price.amount;
  const bundleSavingsAmount = showBundleSavings
    ? (product.original_price.amount - product.bundle_price.amount).toFixed(2) + " SP"
    : null;

  // Bundle selections state — one entry per child item (lazy init from props)
  const [bundleSelections, setBundleSelections] = useState(() => {
    const baseIsBundle = baseProduct?.type === 'bundle' || baseProduct?.is_bundle === true;
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
      if (field === 'colorId') next[index].sizeId = null;
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

  // === Computed ClassNames (avoids complex template literals that confuse Turbopack) ===
  const getSizeBtnClass = (size) => {
    const isSelected = selectedSize?.id === size.id;
    let cls = "w-full h-[3.8rem] border flex justify-center items-center transition-all duration-200";
    cls += isSelected ? " border-black bg-black text-white" : " border-[#D4D4D4] hover:border-gray-400";
    if (!size.in_stock) cls += " opacity-50 cursor-not-allowed bg-gray-100";
    return cls;
  };

  const getAddBtnClass = (added) => {
    let cls = "w-full h-[3.8rem] font-bold text-md transition-colors disabled:cursor-not-allowed";
    cls += added ? " bg-[#D9F99D] text-[#14532D]" : " bg-[#000000] text-white cursor-pointer hover:bg-gray-800";
    return cls;
  };

  const getColorBtnClass = (colorId) => {
    const isActive = activeColor?.id === colorId;
    let cls = "w-[1.8rem] h-[1.8rem] relative cursor-pointer overflow-hidden";
    cls += isActive ? " border-black border-2 ring-black ring-offset-2" : " border-gray-300";
    return cls;
  };

  const getChildColorBtnClass = (colorId, currentSel) => {
    const isActive = currentSel === colorId;
    let cls = "w-[1.5rem] h-[1.5rem] rounded-full border-2";
    cls += isActive ? " border-black ring-2 ring-offset-1 ring-black" : " border-gray-300";
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
        <p className="text-red-500">Product not found</p>
      </div>
    );
  }
  
  // Get available sizes from selected color
  const availableSizes = activeColor?.available_sizes || [];

  // Payment methods data with images
  const paymentMethods = [
    { id: 1, name: "syriatel", image: "/images/syriatel.png" },
    { id: 2, name: "mtn", image: "/images/mtn.png" },
    { id: 3, name: "sham cash", image: "/images/sham.png" },
  ];

  // Sidebar data with arrays
  const sidebarContent = {
    delivery: {
      title: "Delivery Options",
      items: [
        "Standard Delivery: 3-5 business days",
        "Express Delivery: 1-2 business days",
        "Free shipping on orders above 2500 SP",
        "Tracking number will be provided via email",
      ],
    },
    returns: {
      title: "Returns and Exchanges",
      items: [
        "30-day return policy",
        "Items must be unworn with tags attached",
        "Free returns for store credit",
        "Exchange within 14 days of purchase",
      ],
    },
    care: {
      title: "Clothing Care Guide",
      items: [
        "Machine wash cold with like colors",
        "Do not bleach",
        "Tumble dry low",
        "Cool iron if needed",
        "Do not dry clean",
      ],
    },
  };

  // Menu items array
  const menuItems = [
    { id: "delivery", label: "Delivery Options" },
    { id: "returns", label: "Returns and Exchanges" },
    { id: "care", label: "Clothing Care Guide" },
  ];

  const closeSidebar = () => {
    setOpenSidebar(null);
  };

  const currentContent = openSidebar ? sidebarContent[openSidebar] : null;

  // Prepare sidebar content as JSX
  const getSidebarContent = () => {
    if (!currentContent) return null;

    return (
      <div className="space-y-4 mt-6">
        {currentContent.items.map((item, index) => (
          <p key={index} className="text-sm">
            {item}
          </p>
        ))}
      </div>
    );
  };

  const handleToggleFavorite = () => {
    // Get current favorite state from store
    const currentFavoriteState = isFavorite(productId);
    const newFavoriteState = !currentFavoriteState;

    // Show optimistic toast
    const action = newFavoriteState ? "added to" : "removed from";
    toast.success(`Product ${action} favorites successfully`);
    setFavoriteOverride(newFavoriteState);

    // Update store first (optimistic update)
    toggleFavoriteStore(productId);

    // Call the API mutation
    toggleFavoriteApi(product.id, {
      onError: (error) => {
        // Revert on error
        toggleFavoriteStore(productId); // toggle back
        setFavoriteOverride(currentFavoriteState);
        toast.error("Failed to update favorite");
        console.error("Failed to toggle favorite:", error);
      },
      onSuccess: (data) => {
        // If API returns success but with different value, sync it
        if (data?.is_favorite !== undefined && data.is_favorite !== newFavoriteState) {
          setFavorite(productId, data.is_favorite);
          setFavoriteOverride(data.is_favorite);
        }
      }
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
            You save {discountDetails.savings.formatted}
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
    if (isBundle) {
      // Validate bundle's own color
      if (!activeColor) {
        toast.error(t("select_bundle_color"));
        return;
      }

      // Bundle auto-resolves its first available size (bundle size picker removed)
      const bundleSize = activeColor?.available_sizes?.find(s => s.in_stock)
        || activeColor?.available_sizes?.[0]
        || null;

      if (!bundleSize) {
        toast.error(t("select_bundle_size"));
        return;
      }

      // Validate all children have color and size selected
      for (let i = 0; i < bundleSelections.length; i++) {
        const sel = bundleSelections[i];
        const childName = product.bundles?.[i]?.name || t("item_number", { number: i + 1 });
        if (!sel.colorId) {
          toast.error(t("select_color_for", { name: childName }));
          return;
        }
        if (!sel.sizeId) {
          toast.error(t("select_size_for", { name: childName }));
          return;
        }
      }

      setAddedSelectionKey(selectionKey);

      // Build array payload: [bundleColor, child1Color, child2Color, ...]
      const colors_id = [
        activeColor.id,
        ...bundleSelections.map((s) => s.colorId),
      ];
      const sizes_id = [
        bundleSize.id,
        ...bundleSelections.map((s) => s.sizeId),
      ];

      const bundlePrice = product.bundle_price || product.price;

      addToCart({
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
      }, {
        onError: () => {
          setAddedSelectionKey(null);
        },
      });

      return;
    }

    // === Standard (non-bundle) add-to-cart ===
    if (!activeColor) {
      toast.error("Please select a color");
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    setAddedSelectionKey(selectionKey);
    const cartPrice = getCartPricePayload();

    addToCart({
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
    }, {
      onError: () => {
        setAddedSelectionKey(null);
      },
    });
  };
  
  return (
    <div className="lg:pl-[2.3rem] relative">
      <Toaster position="top-right" />

      {/* Sidebar Component */}
      <Sidebar
        isOpen={!!openSidebar}
        onClose={closeSidebar}
        title={currentContent?.title || ""}
        content={getSidebarContent()}
      />

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
          />
        ) : (
          /* ===== STANDARD (NON-BUNDLE) UI ===== */
          <div className="non-bundle-content">
            <div className="space-y-2">
              {renderPrice()}

              {product.discount?.has_discount && (
                <p className="font-bold text-[0.9rem] text-[#EB5757]">
                  {product.discount.type === "category_percentage"
                    ? (product.discount.category_discount_details?.percentage || "") + "% OFF ON THIS CATEGORY"
                    : product.discount.buy_x_get_y_details?.label ||
                      "Special Offer"}
                </p>
              )}

              <p className="text-[0.8rem] text-[#333333]">
                {product.sku || "Product Code: " + product.id} | Color:{" "}
                {activeColor?.name || product.primary_color?.name}
              </p>

              {/* Color Selection */}
              {product.available_colors && product.available_colors.length > 0 && (
                <div className="mt-3">
                  <h1 className="font-bold text-[#000000] text-[0.9rem] mb-2">
                    Available Colors
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
                        aria-label={`Select color ${color.name}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Size Selection */}
            <div>
              <h1 className="font-bold text-[#000000] text-[0.9rem]">Size</h1>
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
                  No sizes available for this color
                </p>
              )}

              <Line mt="mt-[2rem]" />

              {/* Add to Cart and Wishlist Buttons */}
              <div className="flex gap-x-[0.8rem] w-full mt-4">
                <div className="w-[80%]">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddedToCart}
                    className={getAddBtnClass(isAddedToCart)}
                  >
                    {isAddedToCart ? "Added To Cart" : "Add To Cart"}
                  </button>
                </div>
                <div className="w-[20%]">
                  <button
                    onClick={handleToggleFavorite}
                    className="w-full h-[3.8rem] bg-[#000000] flex justify-center items-center cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50"
                    disabled={isPending}
                    aria-label={
                      product.is_favorite
                        ? "Remove from favorites"
                        : "Add to favorites"
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
                Product Detail
              </h1>
              <div
                className={getDropdownChevronClass(isProductDetailsOpen)}
              >
                <MdKeyboardArrowRight />
              </div>
            </div>

            {/* Dropdown Content */}
            <div
              className={getDropdownContentClass(isProductDetailsOpen)}
            >
              <p className="text-[#000000] font-light text-[0.8rem] mt-2">
                {product.description || "Product description goes here"}
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
                  Gender:
                  <span className="text-[0.8rem] font-light ml-1 capitalize">
                    {product.gender}
                  </span>
                </h1>
              )}
            </div>
            <Line mt="mt-4" />
          </div>

          {/* Payment Methods Dropdown */}
          <div className="space-y-1">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsPaymentMethodsOpen(!isPaymentMethodsOpen)}
            >
              <h1 className="font-bold text-[#000000] text-[0.95rem] mt-3">
                Payment Methods
              </h1>
              <div
                className={getDropdownChevronClass(isPaymentMethodsOpen)}
              >
                <MdKeyboardArrowRight />
              </div>
            </div>

            {/* Dropdown Content - Three Images in Flex */}
            <div
              className={getDropdownContentClass(isPaymentMethodsOpen)}
            >
              <p className="text-[0.9rem] text-[#333333] mt-2">
                You can make your payments with digital options:
              </p>
              <div className="flex gap-4 mt-3 mb-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex-1 h-16 bg-gray-100 rounded-lg flex items-center justify-center p-2 border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={method.image}
                        alt={method.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Line mt="mt-4" />
          </div>

          {/* Map through menu items to avoid repetition */}
          {menuItems.map((item) => (
            <div key={item.id}>
              <div
                className="flex justify-between items-center cursor-pointer mt-4"
                onClick={() => setOpenSidebar(item.id)}
              >
                <h1 className="font-bold text-[#000000] text-[0.95rem]">
                  {item.label}
                </h1>
                <div className="text-[1.4rem]">
                  <MdKeyboardArrowRight />
                </div>
              </div>
              <Line mt="mt-4" />
            </div>
          ))}
      </div>
    </div>
  );
};

export default ProductsDetails;
