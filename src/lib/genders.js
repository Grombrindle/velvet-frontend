// Canonical gender slugs used in URLs. These must match the `name.en` values
// returned by the /web/genders API (woman, girls, boys). Kept as a constant so
// routing, metadata and the sitemap can validate routes without a round-trip.

export const GENDERS = ["woman", "girls", "boys"];

export const GENDER_LABELS = {
  woman: { en: "Women", ar: "أزياء نسائية" },
  girls: { en: "Girls", ar: "أزياء بناتية" },
  boys: { en: "Boys", ar: "أزياء صبيانية" },
};

export function isValidGender(gender) {
  return GENDERS.includes(gender);
}
