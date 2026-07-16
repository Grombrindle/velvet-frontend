// components/addressForm.jsx
"use client";
import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster, toast } from "react-hot-toast";
import { useCities, useCountries } from "./hooks/useLocations";
import AddressFormFields from "../ui/formStyle";
import { useAddressUIStore } from "@/lib/store";
import { useAddressSchema } from "./addressSchema";

const AddressForm = ({t, onSubmit: externalOnSubmit, onClose, isLoading = false }) => {
  const { selectedCountryId, setSelectedCountryId } = useAddressUIStore();
  const addressSchema = useAddressSchema(); // Get schema with its own translation

  // Use custom hooks
  const {
    data: countries = [],
    isLoading: countryLoading,
    error: countryError,
    refetch: refetchCountries
  } = useCountries();

  const {
    data: cities = [],
    isLoading: cityLoading,
    error: cityError,
    refetch: refetchCities
  } = useCities(selectedCountryId);

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm({
    resolver: zodResolver(addressSchema),
    mode: "onChange",
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

  // Update selectedCountryId when form value changes
  const watchedCountryId = useWatch({ name: "country_id", control });
  
  useEffect(() => {
    if (watchedCountryId) {
      setSelectedCountryId(watchedCountryId);
    }
  }, [watchedCountryId, setSelectedCountryId]);

  // Show error toast if fetch fails
  useEffect(() => {
    if (countryError) {
      toast.error(t('Failed_to_load_countries'), {
        duration: 5000,
        position: "top-center",
      });
    }
  }, [countryError, t]);

  useEffect(() => {
    if (cityError) {
      toast.error(t('Failed_to_load_cities'), {
        duration: 5000,
        position: "top-center",
      });
    }
  }, [cityError, t]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      type: [data.type],
      country_id: parseInt(data.country_id),
      city_id: parseInt(data.city_id),
    };
    
    try {
      await externalOnSubmit(payload);
      
      // Show success toast
      toast.success(t('Address added successfully!'), {
        duration: 3000,
        position: 'top-center',
        icon: '🎉',
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: 'bold',
        },
      });
      
      reset();
      setSelectedCountryId("");
      // Don't set showSuccess here - let parent handle it
    } catch (error) {
      // Show error toast
      const errorMessage = error.response?.message || 
                          error.response?.error || 
                          t('Failed to add address');
      
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
        icon: '❌',
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: 'bold',
        },
      });
      
      throw error;
    }
  };

  return (
    <>
      <Toaster />
      <form onSubmit={handleSubmit(onSubmit)}>
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
          onRetryCountries={refetchCountries}
          onRetryCities={refetchCities}
          submitButtonText={t('Save')}
          isSubmitting={isLoading}
        />
      </form>
    </>
  );
};

export default AddressForm;