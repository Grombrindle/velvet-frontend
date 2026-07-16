"use client";
import { useTranslations } from "next-intl";

function PaymentFields({ paymentMethod, fields, onChange }) {
  const t = useTranslations("checkout");

  if (!paymentMethod) return null;

  const type = paymentMethod.type;

  if (type === "bank") {
    return (
      <div className="space-y-3 border-t pt-4 mt-3">
        <p className="text-sm font-semibold text-gray-700">
          {t("upload_receipt")}
        </p>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Receipt reference or upload URL"
          value={fields.transfer_receipt || ""}
          onChange={(e) => onChange({ ...fields, transfer_receipt: e.target.value })}
        />
      </div>
    );
  }

  if (type === "phone_otp") {
    return (
      <div className="space-y-3 border-t pt-4 mt-3">
        <label className="text-sm font-semibold text-gray-700">
          {t("phone_for_otp")}
        </label>
        <input
          type="tel"
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="09XX XXX XXX"
          value={fields.phone || ""}
          onChange={(e) => onChange({ ...fields, phone: e.target.value })}
        />
      </div>
    );
  }

  return null;
}

export default PaymentFields;
