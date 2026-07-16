import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export const useFaqCategories = () => {
    return useQuery({
        queryKey: ["faq-categories"],
        queryFn: async() => {
            const response = await apiGet("/faq/categories");
            if (response?.success && response?.result) {
                return response.result;
            }
            return [];
        },
        staleTime: 1000 * 60 * 60, // 1 hour - FAQ categories rarely change
    });
};
export const useFaqByCategory = (categoryId) => {
    return useQuery({
        queryKey: ["faq-category", categoryId],
        queryFn: async() => {
            const response = await apiGet(`/faq/category/${categoryId}`);
            if (response?.success && response?.result) {
                return response.result;
            }
            return null;
        },
        staleTime: 1000 * 60 * 60, // 1 hour - FAQ category rarely changes
        enabled: !!categoryId, // Only run query if categoryId is provided
    });
};