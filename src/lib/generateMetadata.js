export async function generateMetadata({ params }) {
  const { id, gender, locale } = await params;

  // جلب بيانات الفئة فقط للميتاداتا
  const categoryRes = await apiGet(`/categories/${id}?gender=${gender}`, {
    locale,
    next: { revalidate: 300 },
  });

  const category = categoryRes?.result;

  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} | Velvet`,
    description:
      category.description ||
      `Shop the latest ${category.name} collection at Velvet.`,
    openGraph: {
      title: `${category.name} - Velvet Online Store`,
      description: category.description,
      images: [category.image || "/images/default-og.jpg"], // صورة الفئة إذا وجِدت
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: category.name,
      description: category.description,
    },
  };
}
