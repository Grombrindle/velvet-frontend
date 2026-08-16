"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import ProductsDetails from "@/components/productsPage/productsDetails";
import ProductsGrid from "@/components/productsPage/productsGrid";
import { supportedLocales, defaultLocale } from "@/lib/locale";
import Loader from "../ui/loader";

export default function ProductPageClient() {
  const params = useParams();
  const locale = useLocale();
  
  // Get id and locale from params
  const { id, locale: paramLocale } = params;
  const effectiveLocale = supportedLocales.includes(paramLocale) 
    ? paramLocale 
    : locale || defaultLocale;

  // Use React Query for data fetching
  const {
    data: productData,
    isLoading:productDataLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["product", id, effectiveLocale],
    queryFn: async () => {
      const response = await apiGet(`/products/${id}`, {
        locale: effectiveLocale,
      });
      
      if (!response) {
        throw new Error("Product not found");
      }
      
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
  // Render the product page
  if(productDataLoading){
    return(
      <Loader/>
    )
  }
  return (
    <div className="container3 mx-auto lg:mt-[2rem] mt-[5rem]">
      <div className="grid lg:grid-cols-12">
        <div className="lg:col-span-8 col-span-1">
          <ProductsGrid productData={productData} />
        </div>
        <div className="lg:col-span-4 col-span-1">
          <ProductsDetails productData={productData} />
        </div>
      </div>
    </div>
  );
}