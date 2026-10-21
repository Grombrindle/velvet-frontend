import { apiGet } from "@/lib/api";
import { GENDERS } from "@/lib/genders";
import { LOCALES, SITE_URL } from "@/lib/seo";

// Re-generated hourly on the server instead of being frozen at build time.
export const revalidate = 3600;

const absoluteAlternates = (path) => ({
  en: `${SITE_URL}/en${path}`,
  ar: `${SITE_URL}/ar${path}`,
  "x-default": `${SITE_URL}/en${path}`,
});

const toDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : new Date();
};

function entry(path, { locale, priority = 0.7, changeFrequency = "weekly", lastModified } = {}) {
  return {
    url: `${SITE_URL}/${locale}${path}`,
    lastModified: toDate(lastModified),
    changeFrequency,
    priority,
    alternates: { languages: absoluteAlternates(path) },
  };
}

async function fetchProducts() {
  try {
    const res = await apiGet("/products", {
      locale: "en",
      next: { revalidate: 3600 },
    });
    return Array.isArray(res?.result) ? res.result : [];
  } catch {
    return [];
  }
}

async function fetchCategories() {
  const results = await Promise.all(
    GENDERS.map(async (gender) => {
      try {
        const res = await apiGet("/categories", {
          params: { gender },
          locale: "en",
          next: { revalidate: 3600 },
        });
        const list = Array.isArray(res?.result) ? res.result : [];
        return list.map((category) => ({ category, gender }));
      } catch {
        return [];
      }
    })
  );
  return results.flat();
}

export default async function sitemap() {
  const staticEntries = [];
  for (const gender of GENDERS) {
    for (const locale of LOCALES) {
      staticEntries.push(
        entry(`/${gender}`, {
          locale,
          priority: 1,
          changeFrequency: "daily",
        })
      );
    }
  }

  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);

  const productEntries = [];
  for (const product of products) {
    if (!product?.id) continue;
    for (const locale of LOCALES) {
      productEntries.push(
        entry(`/product/${product.id}`, {
          locale,
          priority: 0.8,
          lastModified: product.updated_at,
        })
      );
    }
  }

  const categoryEntries = [];
  const seen = new Set();
  for (const { category, gender } of categories) {
    if (!category?.id) continue;
    const key = `${gender}-${category.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    for (const locale of LOCALES) {
      categoryEntries.push(
        entry(`/${gender}/category/${category.id}`, {
          locale,
          priority: 0.8,
          lastModified: category.updated_at,
        })
      );
    }
  }

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
