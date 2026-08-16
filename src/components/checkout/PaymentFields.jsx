"use client";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import QRCode from "react-qr-code";
import { apiPost } from "@/lib/api";

const UPLOAD_ENDPOINT =
  "/media/upload?field_name=receipt&directory=receipts&allowed_extensions[]=jpg&allowed_extensions[]=png&allowed_extensions[]=pdf&max_size_mb=5";

function PaymentFields({ paymentMethod, fields, onChange }) {
  const t = useTranslations("checkout");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!paymentMethod) return null;

  const type = paymentMethod.type;
  const hints = paymentMethod.method_hints || [];
  const helper = paymentMethod.method_helper || null;
  const inputLayouts = paymentMethod.input_layouts || [];

  const renderHints = () => {
    if (!hints.length) return null;
    return (
      <ul className="space-y-1 text-xs text-gray-500">
        {hints.map((hint, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
            {hint}
          </li>
        ))}
      </ul>
    );
  };

  const renderFields = () => {
    if (!inputLayouts.length) return null;
    return inputLayouts.map((layout, li) => (
      <div key={li} className="space-y-3">
        {(layout.fields || []).map((field) => {
          const value = fields[field.key] || "";
          return (
            <div key={field.id ?? field.key}>
              {field.title && (
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {field.title}
                </label>
              )}
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder={field.hint || ""}
                value={value}
                maxLength={field.configs?.max_length}
                onChange={(e) =>
                  onChange({ ...fields, [field.key]: e.target.value })
                }
              />
            </div>
          );
        })}
      </div>
    ));
  };

  if (type === "wallet") {
    return (
      <div className="space-y-4 border-t pt-4 mt-3">
        {renderHints()}
        {helper?.type === "qr_code" && helper?.value && (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
              <QRCode value={helper.value} size={168} />
            </div>
            <p className="text-xs text-gray-500 text-center">
              {helper.label || t("scan_qr_code")}
            </p>
          </div>
        )}
        {renderFields()}
      </div>
    );
  }

  if (type === "bank") {
    const handleFile = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("receipt", file);
        const res = await apiPost(UPLOAD_ENDPOINT, fd);
        if (res?.success && res?.result) {
          onChange({ ...fields, transfer_receipt: res.result });
        } else {
          alert(t("upload_failed"));
        }
      } catch {
        alert(t("upload_failed"));
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    return (
      <div className="space-y-4 border-t pt-4 mt-3">
        {renderHints()}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">
            {t("upload_receipt")}
          </p>
          {fields.transfer_receipt ? (
            <div className="flex items-center justify-between gap-2 p-2 border rounded-lg bg-gray-50">
              <span className="text-xs text-gray-600 truncate">
                {t("receipt_uploaded")}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer"
                >
                  {t("change_receipt")}
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...fields, transfer_receipt: "" })}
                  className="text-xs font-medium text-red-500 hover:underline cursor-pointer"
                >
                  {t("remove_receipt")}
                </button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-1 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={handleFile}
                disabled={uploading}
              />
              <span className="text-sm text-gray-600">
                {uploading ? t("uploading_receipt") : t("upload_receipt")}
              </span>
              <span className="text-xs text-gray-400">
                JPG, PNG or PDF (max 5MB)
              </span>
            </label>
          )}
        </div>
      </div>
    );
  }

  if (type === "phone_otp") {
    return (
      <div className="space-y-3 border-t pt-4 mt-3">
        {renderHints()}
        <div>
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
      </div>
    );
  }

  return <div className="space-y-3 border-t pt-4 mt-3">{renderHints()}</div>;
}

export default PaymentFields;