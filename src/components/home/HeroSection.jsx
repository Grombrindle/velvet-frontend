"use client";
import { apiGet } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useRouter } from "next/navigation";

function HeroSection({ gender }) {
  const t = useTranslations("categoriesPage")
  const loc = useLocale();
  const isRTL = loc === "ar";
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["home-sliders", gender],
    queryFn: () => apiGet(`/web/home-slider?gender=${gender}`),
    enabled: !!gender,
    staleTime: 24 * 60 * 60 * 1000,
  });
  console.log("home-sliders", data);
  const result = data?.result;
  
  const paginate = useCallback(
    (newDirection) => {
      setCurrentIndex((prevIndex) => {
        let nextIndex = prevIndex + newDirection;
        if (nextIndex >= result?.length) return 0;
        if (nextIndex < 0) return result?.length - 1;
        return nextIndex;
      });
    },
    [result?.length],
  );

  const handleShowMore = (categoryId) => {
    console.log("Category ID:", categoryId); // Debug log
    if (categoryId) {
      router.push(`/${loc}/${gender}/category/${categoryId}`);
    }
  };

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => paginate(1), 5000);
    return () => clearInterval(timer);
  }, [paginate, isHovered]);

  if (!result?.length) return null;

  return (
    <div
      className="relative w-full h-[35rem] md:h-[36rem] overflow-hidden bg-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Removed the drag overlay that was blocking clicks */}
      {/* 
        The drag overlay was preventing button clicks. 
        Instead, we'll add drag to the slider container itself
      */}

      {/* عرض جميع الصور فوق بعضها */}
      {result.map((item, index) => (
        <motion.div
          key={item.id}
          initial={false}
          animate={{
            opacity: index === currentIndex ? 1 : 0,
            zIndex: index === currentIndex ? 10 : 0,
          }}
          transition={{
            opacity: { duration: 0.8, ease: "easeInOut" },
          }}
          className="absolute inset-0 w-full h-full"
          // Add drag to each slide instead
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, { offset, velocity }) => {
            const swipe = Math.abs(offset.x) * velocity.x;
            if (swipe < -10000) paginate(1);
            else if (swipe > 10000) paginate(-1);
          }}
        >
          <Image
            alt={item.title || "Hero Image"}
            src={item.banner}
            fill
            priority={index === 0}
            className="object-cover pointer-events-none" // Prevent image from blocking clicks
          />

          {/* محتوى النص - يتحرك فقط للصورة النشطة */}
          <div className="absolute inset-0 bg-black/30 flex items-center pointer-events-none">
            <div className="container mx-auto px-6 md:px-42">
              <AnimatePresence mode="wait">
                {index === currentIndex && (
                  <div className="max-w-xl text-white">
                    {item.title.trim() !== "" && (
                      <motion.h2
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-3xl md:text-6xl font-bold mb-4 uppercase tracking-tight"
                      >
                        {item.title}
                      </motion.h2>
                    )}
                    {item.description.trim() && (
                      <motion.p
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-sm md:text-lg mb-8 text-white/90"
                      >
                        {item.description}
                      </motion.p>
                    )}
                    <motion.button 
                      onClick={() => {
                        console.log("Button clicked!", item.category_id);
                        handleShowMore(item.category_id);
                      }}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="bg-white text-black px-8 py-3 font-bold text-sm uppercase hover:bg-black hover:text-white transition-all shadow-lg relative z-50 cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                    >
                      {item.button_text || t("show_more")}
                    </motion.button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Arrows - z-index high enough to be clickable */}
      {result.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-2 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all hidden md:flex items-center justify-center cursor-pointer"
            onClick={() => paginate(isRTL ? 1 : -1)}
          >
            <IoIosArrowBack size={30} />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-2 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all hidden md:flex items-center justify-center cursor-pointer"
            onClick={() => paginate(isRTL ? -1 : 1)}
          >
            <IoIosArrowForward size={30} />
          </button>
        </>
      )}
      {/* Pagination Dots */}
      {result.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-3">
          {result.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default HeroSection;