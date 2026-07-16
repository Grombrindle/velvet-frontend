"use client";
import { useEffect } from "react";
import Line from "../ui/line";

// Styles
const radioLabelStyles = "flex items-center gap-1 cursor-pointer";
const radioInputStyles = "w-4 h-4 accent-[#333333]";
const radioTextStyles = "text-[#000000] text-lg font-[400]";
const inputStyles = "w-full h-[3.4rem] bg-white px-2 placeholder:text-[#C4C4C4] focus:outline-0 border border-slate-200 shadow-sm";
const selectStyles = "w-full h-[3.4rem] text-black bg-white px-2 focus:outline-0 shadow-sm";
const textareaStyles = "w-full h-[9rem] bg-white p-2 placeholder:text-[#C4C4C4] focus:outline-0 border border-slate-200 shadow-sm";
const buttonStyles = "w-full h-[4rem] font-bold text-white text-lg cursor-pointer hover:bg-[#7a7a7a] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed";

const AddressFormFields = ({
  t,
  register,
  errors,
  watch,
  setValue,
  countries = [],
  cities = [],
  countryLoading = false,
  cityLoading = false,
  countryError = null,
  cityError = null,
  onCountryChange,
  onRetryCountries,
  onRetryCities,
  showCloseButton = false,
  onClose,
  title = "",
  submitButtonText,
  isSubmitting = false,
  children
}) => {
  const watchedType = watch("type");
  const watchedCountryId = watch("country_id");
  const watchedCityId = watch("city_id");

  const handleTypeChange = (type) => {
    // Store the actual enum value, not the translated text
    setValue("type", type, { shouldValidate: true, shouldDirty: true });
  };

  const handleCountryChange = (e) => {
    const countryId = e.target.value;
    if (onCountryChange) {
      onCountryChange(countryId);
    } else {
      setValue("country_id", countryId, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      setValue("city_id", "", {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setValue("city_id", cityId, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const getSelectTextColor = (value) => {
    return value ? "black" : "#C4C4C4";
  };

  return (
    <div className="lg:mt-0 mt-[6rem]">
      {title && (
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              type="button"
            >
              ×
            </button>
          )}
        </div>
      )}

      {(countryError || cityError) && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex justify-between items-center">
          <span>
            {countryError?.message || cityError?.message || "An error occurred"}
          </span>
          <button
            onClick={() => {
              if (cityError && onRetryCities) onRetryCities();
              if (countryError && onRetryCountries) onRetryCountries();
            }}
            className="text-red-700 hover:text-red-900 text-sm underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col space-y-4">
        {/* Radio Buttons - FIXED: Use enum values, translate display text */}
        <div className="flex gap-x-[3rem]">
          {[
            { value: "Individual", label: t('individual') },
            { value: "Company", label: t('company') }
          ].map((option) => (
            <label key={option.value} className={radioLabelStyles}>
              <input
                type="radio"
                value={option.value}
                checked={watchedType === option.value}
                onChange={() => handleTypeChange(option.value)}
                className={radioInputStyles}
              />
              <span className={radioTextStyles}>{option.label}</span>
            </label>
          ))}
        </div>
        {errors.type && (
          <p className="text-red-500 text-sm mt-[-0.5rem]">{errors.type.message}</p>
        )}

        <Line mt="" />

        {/* Address Title */}
        <div>
          <input
            className={`${inputStyles} ${errors.address_title ? "border-red-500" : ""}`}
            placeholder={t('address_title')}
            {...register("address_title")}
          />
          {errors.address_title && (
            <p className="text-red-500 text-sm mt-1">{errors.address_title.message}</p>
          )}
        </div>

        {/* Name & Surname */}
        <div className="grid grid-cols-2 gap-x-4">
          {["name", "sur_name"].map((field) => (
            <div key={field}>
              <input
                className={`${inputStyles} ${errors[field] ? "border-red-500" : ""}`}
                placeholder={field === "name" ? t('name') : t('sur_name')}
                {...register(field)}
              />
              {errors[field] && (
                <p className="text-red-500 text-sm mt-1">{errors[field].message}</p>
              )}
            </div>
          ))}
        </div>

        {/* Cell Phone */}
        <div>
          <input
            className={`${inputStyles} ${errors.cell_phone ? "border-red-500" : ""}`}
            placeholder={t('phone')}
            {...register("cell_phone")}
          />
          {errors.cell_phone && (
            <p className="text-red-500 text-sm mt-1">{errors.cell_phone.message}</p>
          )}
        </div>

        {/* Country Select */}
        <div>
          <select
            style={{ color: getSelectTextColor(watchedCountryId) }}
            className={`${selectStyles} ${errors.country_id ? "border-red-500" : "border-slate-200"}`}
            onChange={handleCountryChange}
            value={watchedCountryId || ""}
            disabled={countryLoading}
          >
            <option className="text-black" value="" disabled hidden>
              {countryLoading ? t('Loading_countries'): t('select_country')}
            </option>
            {countries.map((country) => (
              <option className="text-black" key={country.id} value={country.id.toString()}>
                {country.name}
              </option>
            ))}
          </select>
          {countryError && (
            <div className="flex items-center justify-between mt-1">
              <p className="text-red-500 text-sm">{t('Failed_to_load_countries')}</p>
              <button
                type="button"
                onClick={onRetryCountries}
                className="text-blue-600 text-sm underline"
              >
                {t('Retry')}
              </button>
            </div>
          )}
          {errors.country_id && (
            <p className="text-red-500 text-sm mt-1">{errors.country_id.message}</p>
          )}
        </div>

        {/* City Select */}
        <div>
          <select
            style={{ color: getSelectTextColor(watchedCityId) }}
            className={`${selectStyles} ${errors.city_id ? "border-red-500" : "border-slate-200"}`}
            onChange={handleCityChange}
            value={watchedCityId || ""}
            disabled={!watchedCountryId || cityLoading}
          >
            <option value="" disabled hidden>
              {!watchedCountryId
                ? t('Select_country_first')
                : cityLoading
                  ? t('Loading_cities')
                  : t('select_city')}
            </option>
            {cities.map((city) => (
              <option className="text-black" key={city.id} value={city.id.toString()}>
                {city.name}
              </option>
            ))}
          </select>
          {cityError && (
            <div className="flex items-center justify-between mt-1">
              <p className="text-red-500 text-sm">{t('Failed_to_load_cities')}</p>
              <button
                type="button"
                onClick={onRetryCities}
                className="text-blue-600 text-sm underline"
              >
                {t('Retry')}
              </button>
            </div>
          )}
          {errors.city_id && (
            <p className="text-red-500 text-sm mt-1">{errors.city_id.message}</p>
          )}
        </div>

        {/* Postal Code */}
        <div>
          <input
            className={`${inputStyles} ${errors.postal_code ? "border-red-500" : ""}`}
            placeholder={t('Postal_Code')}
            {...register("postal_code")}
          />
          {errors.postal_code && (
            <p className="text-red-500 text-sm mt-1">{errors.postal_code.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <textarea
            placeholder={t('Address')}
            className={`${textareaStyles} ${errors.address ? "border-red-500" : ""}`}
            {...register("address")}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${buttonStyles} ${isSubmitting ? "bg-[#959595]" : "bg-black"}`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {isSubmitting === true ? t('Processing') : submitButtonText}
            </div>
          ) : (
            submitButtonText
          )}
        </button>

        {children}
      </div>
    </div>
  );
};

export default AddressFormFields;