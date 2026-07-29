"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useChangeCurrency, useCurrencies } from "./hooks/useCurrencies";
import { toast } from "react-hot-toast";
import Loader from "../ui/loader";
import ErrorState from "../ui/errorMessage";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation"; // ✅ Added router import

const AllCurrencies = () => {
  const t = useTranslations("currencies");
  const router = useRouter(); // ✅ Initialized router

  const { data, isLoading, error } = useCurrencies();
  const changeCurrencyMutation = useChangeCurrency();

  const { setValue, watch, handleSubmit } = useForm();
  const selectedCurrencyId = watch("currencyId");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data?.user_currency) {
      setValue("currencyId", data.user_currency.id);
    }
  }, [data, setValue]);

  const handleCurrencyChange = (currencyId) => {
    setValue("currencyId", currencyId);
  };

  const onSubmit = async (formData) => {
    const currentCurrencyId = data?.user_currency?.id;

    if (!formData.currencyId) {
      toast.error("Please select a currency");
      return;
    }

    if (formData.currencyId === currentCurrencyId) {
      toast.error(t("You_didnt_change_currency"));
      return;
    }

    setIsSaving(true);

    try {
      await changeCurrencyMutation.mutateAsync(formData.currencyId);
      toast.success(t("currency_changed_successfully!"));
      
      // ✅ Tells Next.js to re-fetch Server Components so the ProductPage gets the new currency
      router.refresh(); 
      
    } catch (error) {
      toast.error(error?.message || t("Failed_to_change_currency"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loader text={t("loading_currencies")} />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  const currencies = data?.currencies || [];

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col space-y-[1rem]"
      >
        <h1 className="font-bold text-2xl text-center">
          {t("currency_selection")}
        </h1>

        <p className="text-xl mt-3 px-5">{t("currency_options")}</p>

        <div className="space-y-3">
          {currencies.map((currency) => (
            <div key={currency.id} className="flex items-center px-6 space-x-2">
              <label
                htmlFor={`currency-${currency.id}`}
                className={`text-lg cursor-pointer flex-1 ${
                  selectedCurrencyId === currency.id
                    ? "font-bold"
                    : "font-normal"
                }`}
              >
                {currency.code} - {currency.symbol}
              </label>

              <input
                type="checkbox"
                id={`currency-${currency.id}`}
                checked={selectedCurrencyId === currency.id}
                onChange={() => handleCurrencyChange(currency.id)}
                className="w-5 h-5 accent-black cursor-pointer"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className={`w-[22rem] mt-[1rem] h-[3.5rem] text-white font-bold bg-black ${
            isSaving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
          disabled={isSaving}
        >
          {isSaving ? t("SAVING") : t("SAVE")}
        </button>
      </form>
    </>
  );
};

export default AllCurrencies;