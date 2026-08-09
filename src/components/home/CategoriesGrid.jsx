import React, { Suspense } from "react";
import CategoryCard from "../ui/CategoryCard";

function CategoriesGrid({ data }) {
  console.log("CategoriesGrid", data);
  
  if (!data || data.length === 0) return null;

  const pattern = ["two", "sevenFive", "three"];
  
  let imageIndex = 0;
  let rowIndex = 0;
  const rows = [];

  // Loop until all items from data are rendered
  while (imageIndex < data.length) {
    const layout = pattern[rowIndex % pattern.length];

    // === 2 Columns ===
    if (layout === "two") {
      const rowImages = data.slice(imageIndex, imageIndex + 2);
      if (rowImages.length === 0) break;
      imageIndex += rowImages.length;

      rows.push(
        <div key={rowIndex} className="grid lg:grid-cols-2">
          <Suspense>
            {rowImages.map((item, i) => (
              <CategoryCard
                key={item.id || i}
                id={item.id}
                src={item.image}
                desc={item.name}
              />
            ))}
          </Suspense>
        </div>
      );
    } 
    // === 7 / 5 Layout (Requires 2 items) ===
    else if (layout === "sevenFive") {
      const rowImages = data.slice(imageIndex, imageIndex + 2);
      if (rowImages.length === 0) break;
      imageIndex += rowImages.length;

      rows.push(
        <div key={rowIndex} className="grid lg:grid-cols-12 grid-cols-1">
          <div className="lg:col-span-7 col-span-1">
            <CategoryCard
              id={rowImages[0].id}
              src={rowImages[0].image}
              desc={rowImages[0].name}
            />
          </div>
          {rowImages[1] && (
            <div className="lg:col-span-5 col-span-1">
              <CategoryCard
                id={rowImages[1].id}
                src={rowImages[1].image}
                desc={rowImages[1].name}
              />
            </div>
          )}
        </div>
      );
    } 
    // === 3 Columns ===
    else if (layout === "three") {
      const rowImages = data.slice(imageIndex, imageIndex + 3);
      if (rowImages.length === 0) break;
      imageIndex += rowImages.length;

      rows.push(
        <div key={rowIndex} className="grid lg:grid-cols-3 grid-cols-1">
          {rowImages.map((item, i) => (
            <CategoryCard
              key={item.id || i}
              id={item.id}
              src={item.image}
              desc={item.name}
            />
          ))}
        </div>
      );
    }

    rowIndex++;
  }

  return <div className="w-full">{rows}</div>;
}

export default CategoriesGrid;