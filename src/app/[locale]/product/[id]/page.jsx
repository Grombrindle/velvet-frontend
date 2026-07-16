import ProductsDetails from "@/components/productsPage/productsDetails";
import ProductsGrid from "@/components/productsPage/productsGrid";
import { apiGet } from "@/lib/api";
import { notFound } from "next/navigation";
import { supportedLocales, defaultLocale } from "@/lib/locale";
import {setRequestLocale } from "next-intl/server";

async function ProductPage({ params }) {
  // Get locale from params (same as your Home page)
  const { id, locale: paramLocale } = await params;
  const locale = supportedLocales.includes(paramLocale) ? paramLocale : defaultLocale;

  // Pass locale to apiGet - THIS IS THE KEY PART!
  const productData = await apiGet(`/products/${id}`, {
    locale,  // ← This must be here!
    next: { revalidate: 300 }
  });
  
  // Set the request locale for next-intl
  setRequestLocale(locale);
  
  if (!productData) {
    notFound();
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

export default ProductPage;