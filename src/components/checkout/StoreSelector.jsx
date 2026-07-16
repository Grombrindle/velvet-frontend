"use client";
import { useTranslations } from "next-intl";

function StoreSelector({ stores, selectedStore, onSelect }) {
  const t = useTranslations("checkout");

  if (!stores || stores.length === 0) {
    return (
      <p className="text-sm text-gray-400">{t("section_loading")}</p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-700 mb-2">{t("select_store")}</p>
      {stores.map((store) => (
        <label
          key={store.id}
          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
            selectedStore?.id === store.id
              ? "border-black bg-gray-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="store"
            checked={selectedStore?.id === store.id}
            onChange={() => onSelect(store)}
            className="accent-black"
          />
          <div>
            <p className="font-medium text-sm">{store.name}</p>
            {store.location && (
              <p className="text-xs text-gray-500">{store.location}</p>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}

export default StoreSelector;
