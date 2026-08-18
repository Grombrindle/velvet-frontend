"use client";
import React, { Suspense } from "react";
import ProductCard from "../ui/ProductCard";
import { useCategoryPageStore } from "@/lib/store";
import { motion, AnimatePresence } from "motion/react";

function ProductsGrid({ clothingItems }) {
  const isFilterOpen = useCategoryPageStore((s) => s.isFilterOpen);
  const viewMode = useCategoryPageStore((s) => s.viewMode);

  return (
    <div className="w-full overflow-hidden">
      <motion.div
        className={`grid w-full ${getGridClasses(viewMode, isFilterOpen)}`}
        layout
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence>
          {clothingItems.map((item, index) => {
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
                    viewMode={viewMode} // Pass viewMode to ProductCard
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

function getGridClasses(viewMode, isFilterOpen) {
  if (viewMode === 1) return "md:grid-cols-2 grid-cols-1 place-items-center gap-y-20";
  if (viewMode === 2) return "md:grid-cols-2 grid-cols-1 place-items-center px-52 gap-y-16";
  
  if (viewMode === 3) {
    if (isFilterOpen) {
      return "md:grid-cols-2 lg:grid-cols-3 grid-cols-1 place-items-center px-4 gap-4 gap-y-10";
    }
    return "md:grid-cols-4 grid-cols-1 place-items-center px-4 gap-4 gap-y-10";
  }
  
  if (viewMode === 4) {
    if (isFilterOpen) {
      return "md:grid-cols-4 lg:grid-cols-6 grid-cols-1 gap-x-4 gap-y-[2rem] w-full";
    }
    return "md:grid-cols-8 grid-cols-1 gap-x-4 gap-y-[2rem] w-full";
  }
  
  // Default fallback
  return "grid-cols-1 md:grid-cols-4 gap-4";
}

export default ProductsGrid;