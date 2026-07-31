import { apiGet } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useDeliveryMethods = () => {
    return useQuery({
        queryKey: ['delivery-methods'],
        queryFn: async() => {
            const response = await apiGet("/delivery-methods");
            if (response ?.success && response ?.result) {
                return response.result;
            }
            return [];
        },
        staleTime: 1000 * 60 * 60,
    });
};