import ProductPageClient from "@/components/productsPage/productPageClient";
import ScrollToTop from "@/components/scrollToTop/ScrollToTop";

export const dynamic = "force-dynamic";

async function ProductPage({ params }) {
  // 1. Await params to properly unwrap the promise in Next.js App Router
  const resolvedParams = await params;
  
  console.log("resolvedParams", resolvedParams);

  return (
    <>
      <ScrollToTop/>
      {/* 2. Pass the resolved params or specific properties to your client component */}
      <ProductPageClient params={resolvedParams} />
    </>
  );
}

export default ProductPage;