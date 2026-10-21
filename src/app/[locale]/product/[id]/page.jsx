import ProductPageClient from "@/components/productsPage/productPageClient";
import ScrollToTop from "@/components/scrollToTop/ScrollToTop";
import { apiGet } from "@/lib/api";
import { DEFAULT_OG_IMAGE, languageAlternates, truncate } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id, locale } = await params;

  try {
    const res = await apiGet(`/products/${id}`, {
      locale,
      next: { revalidate: 300 },
    });
    const product = res?.result;

    if (!product) {
      return { title: "Product" };
    }

    const genderLabel =
      product.gender === "girls"
        ? "girls'"
        : product.gender === "boys"
          ? "boys'"
          : "women's";
    const price = product.price?.formatted ? ` ${product.price.formatted}` : "";
    const description = truncate(
      product.short_description ||
        product.description ||
        `Shop ${product.name} at Velvet — ${genderLabel} fashion${price ? ` from${price}` : ""}.`,
      160
    );
    const image =
      product.images?.[0] ||
      product.primary_color?.images?.[0] ||
      product.main_image ||
      DEFAULT_OG_IMAGE;
    const path = `/product/${id}`;

    return {
      title: product.name,
      description,
      alternates: {
        canonical: `/${locale}${path}`,
        languages: languageAlternates(path),
      },
      openGraph: {
        type: "website",
        title: product.name,
        description,
        url: `/${locale}${path}`,
        images: [{ url: image, alt: product.name }],
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description,
        images: [image],
      },
    };
  } catch {
    return { title: "Product" };
  }
}

async function ProductPage({ params }) {
  // 1. Await params to properly unwrap the promise in Next.js App Router
  const resolvedParams = await params;
  return (
    <>
      <ScrollToTop />
      {/* 2. Pass the resolved params or specific properties to your client component */}
      <ProductPageClient params={resolvedParams} />
    </>
  );
}

export default ProductPage;
