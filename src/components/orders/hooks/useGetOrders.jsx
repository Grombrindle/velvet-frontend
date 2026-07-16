import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";

// Custom hook for orders
export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await apiGet("/orders");
      if (response?.success && response?.result) {
        return response.result;
      }
      return [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour - governorates rarely change
  });
};
// Custom hook for a single order by ID
export const useOrder = (orderId) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await apiGet(`/orders/${orderId}`);
      if (response?.success && response?.result) {
        return response.result.order || response.result;
      }
      return null;
    },
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5,
  });
};
export const useRejectionReasons = () => {
  return useQuery({
    queryKey: ["cancellation-reasons"],
    queryFn: async () => {
      const response = await apiGet("/cancellation-reasons");
      if (response?.success && response?.result) {
        return response.result;
      }
      return [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour - governorates rarely change
  });
};
export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, reasonId, reason }) => {
      // Send only reason_id in the body
      const response = await apiPost(`/orders/${orderId}/cancel`, {
        reason_id: reasonId
      });
      
      if (response?.success) {
        return response.result;
      }
      throw new Error(response?.message || "Failed to cancel order");
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch orders queries to update the UI
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
    },
    onError: (error) => {
      console.error("Order cancellation failed:", error);
    },
  });
};