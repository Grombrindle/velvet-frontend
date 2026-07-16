"use client";
import { useFaqStore } from "@/lib/store";
import Image from "next/image";
import { useEffect } from "react";
import { useFaqCategories } from "./hooks/useFaq";
import Loader from "../ui/loader";
import ErrorState from "../ui/errorMessage";
import { useTranslations } from "next-intl";

const FaqGrid = ({ initialCategory = null }) => {
  const t = useTranslations("faq");

  const { data: categoryData, isLoading: categoryDataLoading, error: categoryDataError } = useFaqCategories();
  const { selectedCategory, setCategory } = useFaqStore();
  useEffect(() => {
    if (!selectedCategory && categoryData && categoryData.length > 0) {
      const defaultCategory = initialCategory && categoryData.find(cat => cat.id === initialCategory.id) 
        ? initialCategory 
        : categoryData[0];
      setCategory(defaultCategory);
    }
  }, [categoryData, initialCategory, selectedCategory, setCategory]);

  if (categoryDataLoading) {
    return (
     <Loader text = {t("Loading_faq")}/>
    );
  }

  if (categoryDataError) {
    return (
    <ErrorState message={error.message} />
    );
  }

  return (
    <div className="container4 mx-auto lg:mt-[-0.3rem] mt-[7rem]">
      <div className="grid lg:grid-cols-6 md:grid-cols-3 grid-cols-2 gap-x-3 gap-y-5">
        {categoryData?.map((item) => {
          const isActive = selectedCategory?.id === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setCategory(item)}
              className={`w-full h-[7.6rem] bg-white flex flex-col rounded-lg justify-center items-center cursor-pointer transition-all
                ${isActive ? "border-2 border-black shadow-md" : "border-0 hover:bg-gray-50"}`}
            >
              <div className="flex flex-col space-y-2 justify-center items-center">
                <Image
                  alt={item.desc || item.name || "Category icon"}
                  src={item.image}
                  className="w-[2.8rem] h-14"
                  width={56}
                  height={56}
                 
                />
                <p className="text-[0.8rem] px-4 text-center font-medium">
                  {item.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FaqGrid;