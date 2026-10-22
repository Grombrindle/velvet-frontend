import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

// Custom hook for orders
export const useImprint = () => {
    return useQuery({
        queryKey: ["imprint"],
        queryFn: async() => {
            const response = await apiGet("/imprint");
            if (response ?.success && response ?.result) {
                return response.result;
            }
            return [];
        },
        staleTime: 1000 * 60 * 60,
    });
};