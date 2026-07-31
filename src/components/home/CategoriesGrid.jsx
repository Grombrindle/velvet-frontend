import React, { Suspense } from "react";
import CategoryCard from "../ui/CategoryCard";

function CategoriesGrid({ data }) {
  console.log("CategoriesGrid",CategoriesGrid)
  const pattern = ["two", "sevenFive", "three"];

  let imageIndex = 0;

  return (
    <div className="w-full">
      {Array.from({ length: Math.ceil(data?.length / 3) }).map((_, rowIndex) => {
        if (imageIndex >= data.length) return null;

        const layout = pattern[rowIndex % pattern.length];

        // === 2 Columns ===
        if (layout === "two") {
          const rowImages = data.slice(imageIndex, imageIndex + 2);
          imageIndex += 2;

          return (
            <div key={rowIndex} className="grid lg:grid-cols-2">
              <Suspense>
                {rowImages.map((item, i) => (
                  <CategoryCard
                    key={i}
                    id={item.id}
                    src={item.image}
                    desc={item.name}
                  />
                ))}
              </Suspense>
            </div>
          );
        }

        // === 7 / 5 Layout ===
        if (layout === "sevenFive") {
          const rowImages = data.slice(imageIndex, imageIndex + 2);
          imageIndex += 2;

          if (rowImages.length < 2) return null;

          return (
            <div key={rowIndex} className="grid lg:grid-cols-12 grid-cols-1">
              <div className="lg:col-span-7 col-span-1">
                <CategoryCard
                  id={rowImages[0].id}
                  src={rowImages[0].image}
                  desc={rowImages[0].name}
                />
              </div>
              <div className="lg:col-span-5 col-span-1">
                <CategoryCard
                  id={rowImages[1].id}
                  src={rowImages[1].image}
                  desc={rowImages[1].name}
                />
              </div>
            </div>
          );
        }

        // === 3 Columns ===
        if (layout === "three") {
          const rowImages = data.slice(imageIndex, imageIndex + 3);
          imageIndex += 3;

          return (
            <div key={rowIndex} className="grid lg:grid-cols-3 grid-cols-1">
              {rowImages.map((item, i) => (
                <CategoryCard
                  key={i}
                  id={item.id}
                  src={item.image}
                  desc={item.name}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

export default CategoriesGrid;
