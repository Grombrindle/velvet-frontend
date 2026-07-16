"use client";
import { useTranslations } from "next-intl";
import StoreSelector from "./StoreSelector";
import AddressSelector from "./AddressSelector";

function DeliverySection({
  deliveryMethods,
  selectedDeliveryMethod,
  onDeliveryMethodSelect,
  selectedAddress,
  onAddressSelect,
  defaultAddress,
  stores,
  selectedStore,
  onStoreSelect,
}) {
  const t = useTranslations("checkout");

  if (!deliveryMethods || deliveryMethods.length === 0) {
    return <p className="text-sm text-gray-400">{t("section_loading")}</p>;
  }

  const selectedType = selectedDeliveryMethod?.type;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {deliveryMethods.map((method) => (
          <label
            key={method.id}
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
              selectedDeliveryMethod?.id === method.id
                ? "border-black bg-gray-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="deliveryMethod"
              checked={selectedDeliveryMethod?.id === method.id}
              onChange={() => onDeliveryMethodSelect(method)}
              className="accent-black"
            />
            <div>
              <p className="font-medium text-sm">{method.name}</p>
              {method.estimated_days && (
                <p className="text-xs text-gray-500">
                  {method.estimated_days}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>

      {selectedType === "delivery" && (
        <div className="border-t pt-4 mt-2">
          <AddressSelector
            defaultAddress={defaultAddress}
            selectedAddress={selectedAddress}
            onSelect={onAddressSelect}
          />
        </div>
      )}

      {selectedType === "pickup" && (
        <div className="border-t pt-4 mt-2">
          <StoreSelector
            stores={stores}
            selectedStore={selectedStore}
            onSelect={onStoreSelect}
          />
        </div>
      )}
    </div>
  );
}

export default DeliverySection;
