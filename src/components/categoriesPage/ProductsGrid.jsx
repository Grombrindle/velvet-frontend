"use client";
import React, { Suspense } from "react";
import ProductCard from "../ui/ProductCard";
import { useCategoryPageStore } from "@/lib/store";
import { motion, AnimatePresence } from "motion/react";

function ProductsGrid({ clothingItems }) {
  const isFilterOpen = useCategoryPageStore((s) => s.isFilterOpen);
  const viewMode = useCategoryPageStore((s) => s.viewMode);

  return (
    <div className="overflow-hidden w-full">
      <motion.div
        className={`grid w-full transition-all duration-500 ease-in-out ${
          isFilterOpen ? "translate-x-[0%]" : ""
        } ${getGridClasses(viewMode)}`}
      >
        <AnimatePresence>
          {clothingItems.map((item, index) => {
            // Fallback to a safe unique composite key if item.id is missing
            const uniqueKey = item.id ?? `product-${index}-${item.slug || 'item'}`;
            const isFull = viewMode === 1 && index % 3 === 0;
            
            return (
              <Suspense key={uniqueKey}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    layout: { duration: 0.3, ease: "easeInOut" },
                    opacity: { duration: 0.2 }
                  }}
                  className={isFull ? "col-span-2" : "col-span-1"}
                >
                  <ProductCard
                    item={item}
                    layout={isFull ? "featured" : "standard"}
                    isMini={viewMode === 4}
                  />
                </motion.div>
              </Suspense>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function getGridClasses(viewMode) {
  if (viewMode === 1) return "md:grid-cols-2 grid-cols-1 place-items-center gap-y-20";
  if (viewMode === 2) return "md:grid-cols-2 grid-cols-1 place-items-center px-52 gap-y-16";
  if (viewMode === 3) return "md:grid-cols-4 grid-cols-1 place-items-center px-1 gap-x-4 gap-y-10";
  if (viewMode === 4) return "md:grid-cols-8 grid-cols-1 gap-x-4 gap-y-[2rem] w-full"; 
}

export default ProductsGrid;