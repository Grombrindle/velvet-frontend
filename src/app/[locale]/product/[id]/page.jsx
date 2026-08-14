import ProductPageClient from "@/components/productsPage/productPageClient";
import ScrollToTop from "@/components/scrollToTop/ScrollToTop";

export const dynamic = "force-dynamic";

async function ProductPage({ params }) {
  return (
    <>
      <ScrollToTop />
      <ProductPageClient params={params} />
    </>
  );
}

export default ProductPage;
