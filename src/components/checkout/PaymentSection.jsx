"use client";
import { useTranslations } from "next-intl";
import PaymentFields from "./PaymentFields";

function PaymentSection({
  paymentMethods,
  selectedPaymentMethod,
  onSelect,
  paymentFields,
  onFieldsChange,
}) {
  const t = useTranslations("checkout");

  if (!paymentMethods || paymentMethods.length === 0) {
    return <p className="text-sm text-gray-400">{t("section_loading")}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
              selectedPaymentMethod?.id === method.id
                ? "border-black bg-gray-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={selectedPaymentMethod?.id === method.id}
              onChange={() => onSelect(method)}
              className="accent-black"
            />
            <div>
              <p className="font-medium text-sm">{method.name}</p>
              {method.type && (
                <p className="text-xs text-gray-500 capitalize">{method.type}</p>
              )}
            </div>
          </label>
        ))}
      </div>

      {selectedPaymentMethod && (
        <PaymentFields
          paymentMethod={selectedPaymentMethod}
          fields={paymentFields}
          onChange={onFieldsChange}
        />
      )}
    </div>
  );
}

export default PaymentSection;
