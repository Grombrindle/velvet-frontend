"use client";
import React, { useState } from "react";
import Image from "next/image";
import { IoIosArrowForward, IoIosArrowDown } from "react-icons/io";
import { motion, AnimatePresence } from "motion/react";

const CategoryDropdownMobile = ({ isOpen, onClose }) => {
  const [mobileExpandedSub, setMobileExpandedSub] = useState(null);
  
  const subCategory1 = [
    {
      id: 1,
      name: "Valentines Day",
      images: [
        {
          src: "/images/cloth1.jpg",
          alt: "Valentines Product 1",
          name: "Best Sellers",
        },
        {
          src: "/images/cloth2.jpg",
          alt: "Valentines Product 2",
          name: "Outerwear",
        },
      ],
      products: [
        "Valentines Product 1",
        "Valentines Product 2",
        "Valentines Product 3",
        "Valentines Product 4",
        "Valentines Product 5",
        "Valentines Product 6",
        "Valentines Product 7",
        "Valentines Product 8",
        "Valentines Product 9",
        "Valentines Product 10",
        "Valentines Product 11",
        "Valentines Product 12",
        "Valentines Product 13",
        "Valentines Product 14",
        "Valentines Product 15",
        "Valentines Product 16",
        "Valentines Product 17",
        "Valentines Product 18",
        "Valentines Product 19",
        "Valentines Product 20",
        "Valentines Product 21",
      ],
    },
    {
      id: 2,
      name: "New Season SS26",
      images: [
        {
          src: "/images/cloth4.jpg",
          alt: "New Season Product 1",
          name: "New Arrivals",
        },
        {
          src: "/images/cloth4.jpg",
          alt: "New Season Product 2",
          name: "Trending",
        },
      ],
      products: [
        "New Season Product 1",
        "New Season Product 2",
        "New Season Product 3",
        "New Season Product 4",
        "New Season Product 5",
        "New Season Product 6",
        "New Season Product 7",
        "New Season Product 8",
        "New Season Product 9",
        "New Season Product 10",
        "New Season Product 11",
        "New Season Product 12",
        "New Season Product 13",
        "New Season Product 14",
        "New Season Product 15",
        "New Season Product 16",
        "New Season Product 17",
        "New Season Product 18",
        "New Season Product 19",
        "New Season Product20",
        "New Season Product 21",
      ],
    },
    {
      id: 3,
      name: "Clothes",
      images: [
        {
          src: "/images/cloth1.jpg",
          alt: "Clothes Product 1",
          name: "Dresses",
        },
        { src: "/images/cloth2.jpg", alt: "Clothes Product 2", name: "Tops" },
      ],
      products: [
        "Clothes Product 1",
        "Clothes Product 2",
        "Clothes Product 3",
        "Clothes Product 4",
        "Clothes Product 5",
        "Clothes Product 6",
        "Clothes Product 7",
        "Clothes Product 8",
        "Clothes Product 9",
        "Clothes Product 10",
        "Clothes Product 11",
        "Clothes Product 12",
        "Clothes Product 13",
        "Clothes Product 14",
        "Clothes Product 15",
        "Clothes Product 16",
        "Clothes Product 17",
        "Clothes Product 18",
        "Clothes Product 19",
        "Clothes Product 20",
        "Clothes Product 21",
      ],
    },
    {
      id: 4,
      name: "Velvet Jeans",
      images: [
        {
          src: "/images/cloth1.jpg",
          alt: "Velvet Jeans Product 1",
          name: "Skinny Fit",
        },
        {
          src: "/images/cloth2.jpg",
          alt: "Velvet Jeans Product 2",
          name: "Bootcut",
        },
      ],
      products: [
        "Velvet Jeans Product 1",
        "Velvet Jeans Product 2",
        "Velvet Jeans Product 3",
        "Velvet Jeans Product 4",
        "Velvet Jeans Product 5",
        "Velvet Jeans Product 6",
        "Velvet Jeans Product 7",
        "Velvet Jeans Product 8",
        "Velvet Jeans Product 9",
        "Velvet Jeans Product 10",
        "Velvet Jeans Product 11",
        "Velvet Jeans Product 12",
        "Velvet Jeans Product 13",
        "Velvet Jeans Product 14",
        "Velvet Jeans Product 15",
        "Velvet Jeans Product 16",
        "Velvet Jeans Product 17",
        "Velvet Jeans Product 18",
        "Velvet Jeans Product 19",
        "Velvet Jeans Product 20",
        "Velvet Jeans Product 21",
      ],
    },
    {
      id: 5,
      name: "Collections",
      images: [
        {
          src: "/images/cloth1.jpg",
          alt: "Collections Product 1",
          name: "Summer Edit",
        },
        {
          src: "/images/cloth2.jpg",
          alt: "Collections Product 2",
          name: "Winter Edit",
        },
      ],
      products: [
        "Collections Product 1",
        "Collections Product 2",
        "Collections Product 3",
        "Collections Product 4",
        "Collections Product 5",
        "Collections Product 6",
        "Collections Product 7",
        "Collections Product 8",
        "Collections Product 9",
        "Collections Product 10",
        "Collections Product 11",
        "Collections Product 12",
        "Collections Product 13",
        "Collections Product 14",
        "Collections Product 15",
        "Collections Product 16",
        "Collections Product 17",
        "Collections Product 18",
        "Collections Product 19",
        "Collections Product 20",
        "Collections Product 21",
      ],
    },
    {
      id: 6,
      name: "Partywear",
      images: [
        {
          src: "/images/cloth1.jpg",
          alt: "Partywear Product 1",
          name: "Cocktail Dresses",
        },
        {
          src: "/images/cloth2.jpg",
          alt: "Partywear Product 2",
          name: "Evening Gowns",
        },
      ],
      products: [
        "Partywear Product 1",
        "Partywear Product 2",
        "Partywear Product 3",
        "Partywear Product 4",
        "Partywear Product 5",
        "Partywear Product 6",
        "Partywear Product 7",
        "Partywear Product 8",
        "Partywear Product 9",
        "Partywear Product 10",
        "Partywear Product 11",
        "Partywear Product 12",
        "Partywear Product 13",
        "Partywear Product 14",
        "Partywear Product 15",
        "Partywear Product 16",
        "Partywear Product 17",
        "Partywear Product 18",
        "Partywear Product 19",
        "Partywear Product 20",
        "Partywear Product 21",
      ],
    },
    {
      id: 7,
      name: "Lingerie & Loungewear",
      images: [
        { src: "/images/cloth1.jpg", alt: "Lingerie Product 1", name: "Bras" },
        {
          src: "/images/cloth2.jpg",
          alt: "Lingerie Product 2",
          name: "Panties",
        },
      ],
      products: [
        "Lingerie Product 1",
        "Lingerie Product 2",
        "Lingerie Product 3",
        "Lingerie Product 4",
        "Lingerie Product 5",
        "Lingerie Product 6",
        "Lingerie Product 7",
        "Lingerie Product 8",
        "Lingerie Product 9",
        "Lingerie Product 10",
        "Lingerie Product 11",
        "Lingerie Product 12",
        "Lingerie Product 13",
        "Lingerie Product 14",
        "Lingerie Product 15",
        "Lingerie Product 16",
        "Lingerie Product 17",
        "Lingerie Product 18",
        "Lingerie Product 19",
        "Lingerie Product 20",
        "Lingerie Product 21",
      ],
    },
    {
      id: 8,
      name: "Sportswear",
      images: [
        {
          src: "/images/cloth1.jpg",
          alt: "Sportswear Product 1",
          name: "Active Tops",
        },
        {
          src: "/images/cloth2.jpg",
          alt: "Sportswear Product 2",
          name: "Leggings",
        },
      ],
      products: [
        "Sportswear Product 1",
        "Sportswear Product 2",
        "Sportswear Product 3",
        "Sportswear Product 4",
        "Sportswear Product 5",
        "Sportswear Product 6",
        "Sportswear Product 7",
        "Sportswear Product 8",
        "Sportswear Product 9",
        "Sportswear Product 10",
        "Sportswear Product 11",
        "Sportswear Product 12",
        "Sportswear Product 13",
        "Sportswear Product 14",
        "Sportswear Product 16",
        "Sportswear Product 17",
        "Sportswear Product 18",
        "Sportswear Product 19",
        "Sportswear Product 20",
        "Sportswear Product 21",
      ],
    },
    {
      id: 9,
      name: "Accessory",
      images: [
        { src: "/images/cloth1.jpg", alt: "Accessory Product 1", name: "Bags" },
        {
          src: "/images/cloth2.jpg",
          alt: "Accessory Product 2",
          name: "Jewelry",
        },
      ],
      products: [
        "Accessory Product 1",
        "Accessory Product 2",
        "Accessory Product 3",
        "Accessory Product 4",
        "Accessory Product 5",
        "Accessory Product 6",
        "Accessory Product 7",
        "Accessory Product 8",
        "Accessory Product 9",
        "Accessory Product 10",
        "Accessory Product 11",
        "Accessory Product 12",
        "Accessory Product 13",
        "Accessory Product 14",
        "Accessory Product 15",
        "Accessory Product 16",
        "Accessory Product 17",
        "Accessory Product 18",
        "Accessory Product 19",
        "Accessory Product 20",
        "Accessory Product 21",
      ],
    },
  ];

  const toggleMobileSubCategory = (id) => {
    setMobileExpandedSub(mobileExpandedSub === id ? null : id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 top-[60px] bg-white z-50 overflow-y-auto lg:hidden"
          style={{ height: "calc(100vh - 60px)" }}
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Categories</h2>
              <button 
                onClick={() => {
                  onClose();
                  setMobileExpandedSub(null);
                }}
                className="text-gray-500 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              {subCategory1.map((subCategory) => (
                <div key={subCategory.id} className="border-b border-gray-100">
                  {/* Category Header */}
                  <div
                    className="flex justify-between items-center py-3 cursor-pointer"
                    onClick={() => toggleMobileSubCategory(subCategory.id)}
                  >
                    <span className="text-[#000000] font-medium">
                      {subCategory.name}
                    </span>
                    {mobileExpandedSub === subCategory.id ? (
                      <IoIosArrowDown className="text-gray-600" />
                    ) : (
                      <IoIosArrowForward className="text-gray-600" />
                    )}
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {mobileExpandedSub === subCategory.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        {/* Images */}
                        <div className="grid grid-cols-2 gap-2 mb-4 mt-2">
                          {subCategory.images.map((image, index) => (
                            <div key={index} className="relative">
                              <Image
                                className="object-cover w-full rounded-lg"
                                style={{ height: "8rem" }}
                                src={image.src}
                                alt={image.alt}
                                width={200}
                                height={0}
                              />
                              <p className="text-[#000000] text-[0.8rem] font-medium mt-1 text-center">
                                {image.name}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Products */}
                        <div className="mb-4">
                          <h3 className="text-[0.9rem] font-semibold mb-2">
                            All products
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            {subCategory.products.map((product, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 p-2 rounded-lg"
                              >
                                <p className="text-[#000000] text-[0.75rem]">
                                  {product}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CategoryDropdownMobile;