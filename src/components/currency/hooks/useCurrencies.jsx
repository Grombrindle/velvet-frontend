import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";

export const useCurrencies = () => {
    return useQuery({
        queryKey: ["currencies"],
        queryFn: async() => {
            const response = await apiGet("/currencies");
            if (response?.success && response?.result) {
                return response.result;
            }
            return [];
        },
        staleTime: 1000 * 60 * 60,
    });
};
export const useChangeCurrency = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (currency_id) => {
            const response = await apiPost("/change-currency", { currency_id });
            if (response?.success) {
                return response?.result;
            }
        },
        onSuccess: () => {
            // Invalidate currencies query to refetch updated data
            queryClient.invalidateQueries({ queryKey: ["currencies"] });
        },
    });
};