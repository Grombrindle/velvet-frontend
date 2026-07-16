"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useLocale } from "next-intl";
import Link from "next/link";
import LottieAnimationPlayer from "@/loader/LottieAnimationPlayer";

const CategoryDropdown = ({
  hoveredCategory,
  onMouseEnter,
  onMouseLeave,
  locale,
  activeGender,
}) => {
  const [hoveredSubCategory, setHoveredSubCategory] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const currentLocale = useLocale();

  const [isImageLoading, setIsImageLoading] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["categoryData", hoveredCategory],
    queryFn: () => apiGet(`/web/categories-products/${hoveredCategory}`),
    enabled: !!hoveredCategory, // لا يتم التفعيل إلا إذا كان هناك Category محدد
    staleTime: 1000 * 60 * 5, // كاش لمدة 5 دقائق
  });

  const categories = data?.result?.categories || [];

  // تحديد الـ SubCategory المختار (افتراضياً أول واحد إذا لم يتم التحويم)
  const selectedSubCategory = hoveredSubCategory
    ? categories.find((cat) => cat.id === hoveredSubCategory)
    : categories;

  // تجهيز الصور للعرض (Latest و Trending)
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

  return (
    <AnimatePresence>
      {hoveredCategory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ease: "easeInOut", duration: 0.3 }}
          className="absolute left-0 w-full bg-white shadow-lg z-50 overflow-y-auto hidden lg:block"
          style={{ height: "30rem" }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={() => {
            onMouseLeave();
            setHoveredSubCategory(null);
          }}
        >
          <div className="container2 mx-auto mt-12">
            {isLoading ? (
              <div className="size-full flex items-center justify-center mt-20">
                <LottieAnimationPlayer />
              </div>
            ) : (
              <div className="grid grid-cols-12">
                {/* Categories & Products Section */}
                <div className="col-span-7 ml-1">
                  <div className="grid grid-cols-7 gap-x-4">
                    {/* First Column: SubCategories List */}
                    <div className="col-span-2 space-y-2 border-r border-gray-100">
                      {categories.map((sub) => (
                        <Link
                          href={`/${locale}/${hoveredCategory}/category/${sub.id}`}
                          className="flex gap-x-4 items-center  pr-4"
                          key={sub.id}
                          onMouseEnter={() => setHoveredSubCategory(sub.id)}
                        >
                          <p
                            className={`text-[#000000] font-400 text-[0.95rem] cursor-pointer transition-all ${
                              selectedSubCategory?.id === sub.id
                                ? "font-bold translate-x-1"
                                : ""
                            }`}
                          >
                            {sub.name}
                          </p>
                          {selectedSubCategory?.id === sub.id && (
                            <>
                              {locale === "en" && (
                                <IoIosArrowForward className="text-gray-400" />
                              )}
                              {locale === "ar" && (
                                <IoIosArrowBack className="text-gray-400" />
                              )}
                            </>
                          )}
                        </Link>
                      ))}
                    </div>

                    {/* Second Column: Products Display */}
                    <div className="col-span-5">
                      {selectedSubCategory.name && (
                        <div>
                          <h3 className="text-[0.9rem] font-bold mb-4 p-1 border-b w-fit">
                            {currentLocale === "ar"
                              ? "كل المنتجات"
                              : "All Products"}
                          </h3>
                          <div className="grid grid-cols-3 gap-2">
                            {selectedSubCategory?.products?.map(
                              (product, index) => (
                                <div
                                  key={product.id}
                                  className="relative inline-block w-fit p-1"
                                  onMouseEnter={() =>
                                    setHoveredProduct(product.id)
                                  }
                                  onMouseLeave={() => setHoveredProduct(null)}
                                >
                                  <AnimatePresence mode="wait">
                                    {hoveredProduct === product.id && (
                                      <motion.div
                                        key="hover-overlay"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute cursor-pointer inset-0 bg-black text-white px-4 py-2 z-10 flex items-center justify-center rounded-sm"
                                      >
                                        <Link
                                          href={`/${locale}/product/${product.id}`}
                                          className="text-[0.8rem] whitespace-nowrap"
                                        >
                                          {product.name}
                                        </Link>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                  <p
                                    className={`text-[#000000] font-normal text-[0.8rem] transition-colors duration-200 ${
                                      hoveredProduct === product.id
                                        ? "invisible"
                                        : "visible"
                                    }`}
                                  >
                                    {product.name}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Third Section: Dynamic Images */}
                <div className="col-span-5 mr-[4rem] mt-2">
                  <div className="grid grid-cols-2 gap-x-[2rem]">
                    {displayImages.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="relative h-[20rem] overflow-hidden group">
                          <Image
                            key={image.src}
                            className="object-cover w-full transition-transform duration-500 group-hover:scale-105"
                            src={image.src}
                            alt={image.alt}
                            fill
                            onLoad={() => setIsImageLoading(false)}
                          />
                          <div
                            className={`absolute size-full inset-0 flex items-center justify-center bg-gray-200 transition-opacity duration-300 ${
                              isImageLoading
                                ? "opacity-100"
                                : "opacity-0 pointer-events-none"
                            }`}
                          >
                            <LottieAnimationPlayer />
                          </div>
                        </div>
                        <p className="text-[#000000] text-[0.95rem] font-semibold mt-3">
                          {image.name}
                        </p>
                        <p className="text-gray-500 text-[0.8rem]">
                          {image.alt}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CategoryDropdown;
