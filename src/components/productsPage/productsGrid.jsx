// components/productsPage/productsGrid.js
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

const ProductsGrid = ({ productData }) => {
  const initialColor = productData?.result?.available_colors?.[0] || null;
  const [selectedColor, setSelectedColor] = useState(null);

  // Listen for color changes from ProductsDetails
  useEffect(() => {
    const handleColorChange = (event) => {
      setSelectedColor(event.detail);
    };

    window.addEventListener('colorChanged', handleColorChange);
    
    return () => {
      window.removeEventListener('colorChanged', handleColorChange);
    };
  }, [productData]);

  const activeColor = selectedColor || initialColor;

  // Get images based on selected color
  const getImagesToDisplay = () => {
    if (activeColor?.images?.length > 0) {
      return activeColor.images;
    }
    
    // Fallback to primary color images
    if (productData?.result?.primary_color?.images?.length > 0) {
      return productData.result.primary_color.images;
    }
    
    // Last fallback to the main product images array
    return productData?.result?.images || [];
  };

  const imagesToDisplay = getImagesToDisplay();

  if (!imagesToDisplay || imagesToDisplay.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No images available for this color</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid lg:grid-cols-2 lg:gap-y-0 gap-y-[2rem] grid-cols-1">
        {imagesToDisplay.map((image, index) => (
          <div
            key={index}
            className="relative w-full lg:h-[37rem] md:h-[25rem] h-[20rem]"
          >
            <Image
              src={image}
              fill
              className="object-cover"
              alt={`product image ${index + 1}`}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={index === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsGrid;
