"use client";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCities, useCountries } from "./hooks/useLocations";
import { useAddressUIStore } from "@/lib/store";
import AddressFormFields from "../ui/formStyle";
import { toast } from "react-hot-toast";
import { useAddressSchema } from "./addressSchema";

const AddressFormEdit = ({t, address, onSubmit, onClose, isLoading }) => {
  // Get selectedCountryId and setter from store
  const { selectedCountryId, setSelectedCountryId } = useAddressUIStore();
    const addressSchema = useAddressSchema(); // Get schema with its own translation

  // Store original form values for change detection (lazy init from address prop)
  const [originalValues, setOriginalValues] = useState(() => {
    if (!address) return {};
    return {
      type: address.type?.[0] || "Individual",
      address_title: address.address_title || "",
      name: address.name || "",
      sur_name: address.sur_name || "",
      cell_phone: address.cell_phone || "",
      postal_code: address.postal_code || "",
      address: address.address || "",
      country_id: address.country?.id?.toString() || "",
      city_id: address.city?.id?.toString() || "",
    };
  });

  // Fetch countries using React Query
  const {
    data: countries = [],
    isLoading: countryLoading,
    error: countryError,
    refetch: refetchCountries,
  } = useCountries();

  // Fetch cities based on selected country from store
  const {
    data: cities = [],
    isLoading: cityLoading,
    error: cityError,
    refetch: refetchCities,
  } = useCities(selectedCountryId);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      type: "Individual",
      address_title: "",
      name: "",
      sur_name: "",
      cell_phone: "",
      postal_code: "",
      address: "",
      country_id: "",
      city_id: "",
    },
  });

  // Watch country_id to fetch cities when it changes
  const countryId = useWatch({ name: "country_id", control });

  // Update selected country in store when it changes
  useEffect(() => {
    if (countryId) {
      setSelectedCountryId(countryId);
      setValue("city_id", "");
    }
  }, [countryId, setSelectedCountryId, setValue]);

  // Populate form with address data when component mounts
  useEffect(() => {
    if (address) {
      const countryId = address.country?.id?.toString() || "";
      const cityId = address.city?.id?.toString() || "";

      const formValues = {
        type: address.type?.[0] || "Individual",
        address_title: address.address_title || "",
        name: address.name || "",
        sur_name: address.sur_name || "",
        cell_phone: address.cell_phone || "",
        postal_code: address.postal_code || "",
        address: address.address || "",
        country_id: countryId,
        city_id: cityId,
      };

      // Set all form values
      setValue("type", formValues.type);
      setValue("address_title", formValues.address_title);
      setValue("name", formValues.name);
      setValue("sur_name", formValues.sur_name);
      setValue("cell_phone", formValues.cell_phone);
      setValue("postal_code", formValues.postal_code);
      setValue("address", formValues.address);
      setValue("country_id", formValues.country_id);
      
      // Set selected country in store
      if (countryId) {
        setSelectedCountryId(countryId);
        // Then set city after a brief delay to ensure cities are loaded
        setTimeout(() => {
          setValue("city_id", cityId);
          setOriginalValues((prev) => ({ ...prev, city_id: cityId }));
        }, 100);
      }
    }
  }, [address, setValue, setSelectedCountryId]);

  const onFormSubmit = async (data) => {
    // Check if any changes were made by comparing with stored original values
    const hasChanged = (
      data.type !== originalValues.type ||
      data.address_title !== originalValues.address_title ||
      data.name !== originalValues.name ||
      data.sur_name !== originalValues.sur_name ||
      data.cell_phone !== originalValues.cell_phone ||
      data.postal_code !== originalValues.postal_code ||
      data.address !== originalValues.address ||
      data.country_id !== originalValues.country_id ||
      data.city_id !== originalValues.city_id
    );

    if (!hasChanged) {
      toast.error(t('no_changes_to_edit'), {
       
      });
      return; // Stop submission
    }

    // Prepare payload for API
    const payload = {
      ...data,
      type: [data.type],
      country_id: parseInt(data.country_id),
      city_id: parseInt(data.city_id),
    };

    try {
      // Call the onSubmit prop from parent component
      await onSubmit(payload);

      // Show success toast
      toast.success(t('Address updated successfully!'), {
        duration: 3000,
        position: "top-center",
        icon: "✅",
        style: {
          background: "#10B981",
          color: "#fff",
          fontWeight: "bold",
          padding: "10px",
          borderRadius: "8px",
        },
      });
      
      // Close form after successful update
      onClose();
    } catch (error) {
      // Show error toast
      const errorMessage = error.response?.error || t('Failed to update address');

      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
        icon: "❌",
        style: {
          background: "#EF4444",
          color: "#fff",
          fontWeight: "bold",
          padding: "10px",
          borderRadius: "8px",
        },
      });

      // Re-throw the error so the parent component knows it failed
      throw error;
    }
  };

  const handleCountryChange = (countryId) => {
    setSelectedCountryId(countryId);
    setValue("country_id", countryId, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const isSubmitting = countryLoading || cityLoading || isLoading;

  return (
    <>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <AddressFormFields
        t={t}
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          countries={countries}
          cities={cities}
          countryLoading={countryLoading}
          cityLoading={cityLoading}
          countryError={countryError}
          cityError={cityError}
          onCountryChange={handleCountryChange}
          onRetryCountries={refetchCountries}
          onRetryCities={refetchCities}
          showCloseButton={true}
          onClose={onClose}
          title="Edit Address"
          submitButtonText={t('update_address')}
          isSubmitting={isSubmitting}
        />
      </form>
    </>
  );
};

export default AddressFormEdit;