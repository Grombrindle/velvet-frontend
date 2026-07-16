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
        layout="preserve-aspect"
        className={`grid  w-full transition-all duration-500 ease-in-out ${
          isFilterOpen ? " translate-x-[0%] " : ""
        } ${getGridClasses(viewMode)}`}
      >
        <AnimatePresence mode="sync">
          {clothingItems.map((item, index) => {
            const isFull = viewMode === 1 && index % 3 === 0;
            return (
              <Suspense key={item.id ?? index}>
                <motion.div
                  layout="position"
                  transition={{
                    ease: "easeInOut",
                    duration: 0.5,
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
      {/* <div className="flex justify-center mt-8">
        <ShowMoreButton />
      </div> */}
    </div>
  );
}
function getGridClasses(viewMode) {
  if (viewMode === 1) return "grid-cols-2 place-items-center gap-y-20";
  if (viewMode === 2) return "grid-cols-2 place-items-center px-52 gap-y-16";
  if (viewMode === 3) return "grid-cols-4 place-items-center px-1 gap-y-10";
  if (viewMode === 4) return "grid-cols-8 place-items-center";
  return "place-items-center";
}

export default ProductsGrid;
