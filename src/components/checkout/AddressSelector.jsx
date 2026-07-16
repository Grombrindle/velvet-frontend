"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAddresses, useAddAddress } from "@/components/address/hooks/useAddressQueries";
import AddressForm from "@/components/address/addressForm";

function AddressSelector({ defaultAddress, selectedAddress, onSelect }) {
  const t = useTranslations("checkout");
  const at = useTranslations("address");
  const [showForm, setShowForm] = useState(false);

  const { data: addresses = [], isLoading, error } = useAddresses();
  const addMutation = useAddAddress();

  const list = addresses.length > 0 ? addresses : (defaultAddress ? [defaultAddress] : []);

  const handleAddAddress = async (addressData) => {
    const res = await addMutation.mutateAsync(addressData);
    const newAddress = res?.result || res;
    if (newAddress?.id) {
      onSelect(newAddress);
    }
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-semibold text-sm mb-3">{at("Add_New_Address")}</h4>
        <AddressForm
          t={at}
          onSubmit={handleAddAddress}
          onClose={() => setShowForm(false)}
          isLoading={addMutation.isPending}
        />
        <button
          className="text-xs text-gray-500 underline mt-2"
          onClick={() => setShowForm(false)}
        >
          Cancel
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <p className="text-sm text-gray-400">{t("section_loading")}</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">{t("section_error")}</p>;
  }

  if (list.length === 0) {
    return (
      <div>
        <p className="text-sm text-gray-500 mb-3">{t("no_addresses")}</p>
        <button
          className="text-sm font-semibold underline"
          onClick={() => setShowForm(true)}
        >
          {t("add_address")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-700 mb-2">{t("select_address")}</p>
      {list.map((addr) => (
        <label
          key={addr.id}
          className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${
            selectedAddress?.id === addr.id
              ? "border-black bg-gray-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="address"
            checked={selectedAddress?.id === addr.id}
            onChange={() => onSelect(addr)}
            className="accent-black mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{addr.address_title}</p>
              {addr.is_default && (
                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                  {at("Default")}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600">
              {addr.name} {addr.sur_name}
            </p>
            <p className="text-xs text-gray-500">
              {addr.country?.name}, {addr.city?.name}, {addr.address}
            </p>
            <p className="text-xs text-gray-500">{addr.cell_phone}</p>
          </div>
        </label>
      ))}
      <button
        className="text-sm font-semibold underline mt-2"
        onClick={() => setShowForm(true)}
      >
        {t("add_address")}
      </button>
    </div>
  );
}

export default AddressSelector;
