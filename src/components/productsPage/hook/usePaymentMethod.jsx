import { apiGet } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const usePaymentMethods = () => {
    return useQuery({
        queryKey: ['payment-methods'],
        queryFn: async() => {
            const response = await apiGet("/payment-methods");
            if (response ?.success && response ?.result) {
                return response.result;
            }
            return [];
        },
        staleTime: 1000 * 60 * 60,
    });
};