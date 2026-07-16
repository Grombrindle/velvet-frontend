// hooks/useAddressQueries.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "@/lib/api";

export const addressKeys = {
  all: ["addresses"],
  lists: () => [...addressKeys.all, "list"],
  details: () => [...addressKeys.all, "detail"],
  detail: (id) => [...addressKeys.details(), id],
};

// Fetch addresses hook
export const useAddresses = () => {
  return useQuery({
    queryKey: addressKeys.lists(),
    queryFn: async () => {
      const response = await apiGet("/my-addresses");

      if (response?.success && Array.isArray(response.result)) {
        return response.result;
      } else if (Array.isArray(response)) {
        return response;
      }
      return [];
    },
  });
};

// Add address mutation
export const useAddAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressData) => apiPost("/addresses", addressData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });
};

// Update address mutation
export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => apiPut(`/addresses/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: addressKeys.detail(variables.id),
      });
    },
  });
};

// Delete address mutation
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiDelete(`/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });
};
// components/address/hooks/useAddressQueries.js (add this new mutation)

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId) => {
      const response = await apiPatch(`/addresses/${addressId}/set-default`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};
