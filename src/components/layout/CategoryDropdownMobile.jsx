"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { IoIosArrowBack, IoIosArrowForward, IoIosArrowDown } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useLocale } from "next-intl";
import Link from "next/link";
import LottieAnimationPlayer from "@/loader/LottieAnimationPlayer";

const CategoryDropdownMobile = ({ 
  isOpen, 
  onClose, 
  handleNavigation,
  activeGender,
  localePrefix 
}) => {
  const [mobileExpandedSub, setMobileExpandedSub] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const currentLocale = useLocale();
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Get the currently selected category from URL or use default
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch categories data when dropdown is open
  const { data, isLoading, error } = useQuery({
    queryKey: ["categoryData", activeGender],
    queryFn: () => apiGet(`/web/categories-products/${activeGender}`),
    enabled: !!isOpen && !!activeGender,
    staleTime: 1000 * 60 * 5,
  });

  const categories = data?.result?.categories || [];

  // Set default selected category when data loads
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  // Reset expanded sub when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setMobileExpandedSub(null);
    }
  }, [isOpen]);

  const toggleMobileSubCategory = (categoryId) => {
    setMobileExpandedSub(mobileExpandedSub === categoryId ? null : categoryId);
    // Find and set selected category
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      setSelectedCategory(category);
    }
  };

  // Get selected category data
  const selectedSubCategory = selectedCategory || categories[0];

  // Prepare display images (Latest & Trending)
  const displayImages = [];
  if (selectedSubCategory?.latest_product) {
    displayImages.push({
      src: selectedSubCategory.latest_product.image,
      name: currentLocale === "ar" ? "أحدث المنتجات" : "Latest Products",
      alt: selectedSubCategory.latest_product.name,
    });
  }
  if (selectedSubCategory?.trending_product) {
    displayImages.push({
      src: selectedSubCategory.trending_product.image,
      name: currentLocale === "ar" ? "الأكثر رواجاً" : "Trending Now",
      alt: selectedSubCategory.trending_product.name,
    });
  }

  // Close dropdown handler
  const handleClose = () => {
    setMobileExpandedSub(null);
    setSelectedCategory(null);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-white overflow-y-auto"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LottieAnimationPlayer />
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              {currentLocale === "ar" ? "حدث خطأ في تحميل البيانات" : "Error loading categories"}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              {currentLocale === "ar" ? "لا توجد فئات" : "No categories available"}
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="border-b border-gray-100">
                  {/* Category Header */}
                  <div
                    className="flex justify-between items-center py-3 px-2 cursor-pointer"
                    onClick={() => toggleMobileSubCategory(category.id)}
                  >
                    <span className={`text-[#000000] font-medium ${
                      selectedCategory?.id === category.id ? "font-bold" : ""
                    }`}>
                      {category.name}
                    </span>
                    {mobileExpandedSub === category.id ? (
                      <IoIosArrowDown className="text-gray-600" />
                    ) : (
                      <IoIosArrowForward className="text-gray-600" />
                    )}
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {mobileExpandedSub === category.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden px-2"
                      >
                        {/* Display Images (Latest & Trending) */}
                        {displayImages.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-4 mt-2">
                            {displayImages.map((image, index) => (
                              <div key={index} className="relative">
                                <div className="relative w-full h-32 overflow-hidden rounded-lg">
                                  <Image
                                    className="object-cover w-full transition-transform duration-300 hover:scale-105"
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    onLoad={() => setIsImageLoading(false)}
                                  />
                                  {isImageLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                      <LottieAnimationPlayer />
                                    </div>
                                  )}
                                </div>
                                <p className="text-[#000000] text-[0.8rem] font-medium mt-1 text-center">
                                  {image.name}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Products List */}
                        {selectedSubCategory?.products?.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-[0.9rem] font-semibold mb-2">
                              {currentLocale === "ar" ? "كل المنتجات" : "All Products"}
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                              {selectedSubCategory.products.map((product) => (
                                <Link
                                  key={product.id}
                                  href={`/${currentLocale}/product/${product.id}`}
                                  onClick={() => {
                                    handleClose();
                                    if (handleNavigation) handleNavigation();
                                  }}
                                >
                                  <div 
                                    className="bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    onMouseEnter={() => setHoveredProduct(product.id)}
                                    onMouseLeave={() => setHoveredProduct(null)}
                                  >
                                    <p className={`text-[#000000] text-[0.75rem] ${
                                      hoveredProduct === product.id ? "font-bold" : ""
                                    }`}>
                                      {product.name}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CategoryDropdownMobile;