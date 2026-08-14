import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

// Custom hook for orders
export const usePrivacyPolicy = () => {
    return useQuery({
        queryKey: ["privacy-policy"],
        queryFn: async() => {
            const response = await apiGet("/privacy-policy");
            if (response ?.success && response ?.result) {
                return response.result;
            }
            return [];
        },
        staleTime: 1000 * 60 * 60,
    });
};