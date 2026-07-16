"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";

export function useCheckoutOptions() {
  return useQuery({
    queryKey: ["checkout", "options"],
    queryFn: async () => {
      const [deliveryRes, paymentRes] = await Promise.allSettled([
        apiGet("/delivery-methods/with-default-address"),
        apiGet("/payment-methods/checkout-options"),
      ]);

      const deliveryData = deliveryRes.status === "fulfilled"
        ? (deliveryRes.value?.result || deliveryRes.value || {})
        : {};
      const paymentData = paymentRes.status === "fulfilled"
        ? (paymentRes.value?.result || paymentRes.value || {})
        : {};

      return {
        deliveryMethods: deliveryData.delivery_options || [],
        stores: deliveryData.stores || [],
        defaultAddress: deliveryData.my_default_address || null,
        paymentMethods: paymentData.payment_methods || paymentData || [],
      };
    },
    staleTime: 60 * 1000,
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const hasFile = Object.values(data.fields || {}).some(
        (v) => v instanceof File
      );

      if (hasFile) {
        const fd = new FormData();
        fd.append("delivery_method_id", data.delivery_method_id);
        fd.append("payment_method_id", data.payment_method_id);
        if (data.address_id) fd.append("address_id", data.address_id);
        if (data.store_id) fd.append("store_id", data.store_id);
        for (const [key, value] of Object.entries(data.fields)) {
          fd.append(`fields[${key}]`, value);
        }
        return apiPost("/orders/checkout", fd);
      }

      return apiPost("/orders/checkout", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
