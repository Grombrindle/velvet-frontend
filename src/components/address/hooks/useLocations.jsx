// hooks/useLocationQueries.js
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

// Query keys
export const locationKeys = {
  countries: ['countries'],
  cities: (country_id) => ['cities', country_id],
};

// Custom hook for countries
export const useCountries = () => {
  return useQuery({
    queryKey: locationKeys.countries,
    queryFn: async () => {
      const response = await apiGet("/countries");
      if (response?.success && response?.result) {
        return response.result;
      }
      return [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour - governorates rarely change
  });
};

// Custom hook for cities
export const useCities = (countryId) => {
  return useQuery({
    queryKey: locationKeys.cities(countryId),
    queryFn: async () => {
      if (!countryId) return [];
      const response = await apiGet(`/cities?country_id=${countryId}`);
      if (response?.success && response?.result) {
        return response.result;
      }
      return [];
    },
    enabled: !!countryId, // Only run if governorate is selected
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};