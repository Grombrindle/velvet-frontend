import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import Cookies from "js-cookie";

/**
 * Helper to check for an existing user/guest token, 
 * or request a new guest token if the user is unauthenticated.
 */
async function ensureGuestToken() {
    // Check if a token already exists in cookies or store
    const userToken = Cookies.get("token");
    const guestToken = Cookies.get("guest_token");
    
    if (userToken || guestToken) return userToken || guestToken;

    try {
        // Call your guest endpoint (update "/guest" if your route is different, e.g., "/auth/guest")
        const response = await apiPost("/guest"); 
        const token = response?.result?.token || response?.token;
        
        if (token) {
            Cookies.set("guest_token", token, { expires: 7, secure: true });
            return token;
        }
    } catch (error) {
    }
    return null;
}

export const useCurrencies = () => {
    return useQuery({
        queryKey: ["currencies"],
        queryFn: async () => {
            // Ensure a guest token is available before calling the API
            await ensureGuestToken();

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
            await ensureGuestToken();

            const response = await apiPost("/change-currency", { currency_id });
            if (response?.success) {
                return response?.result;
            }
            throw new Error(response?.message || "Failed to change currency");
        },
        onSuccess: () => {
            // ✅ Invalidate currencies AND products/cart so they refetch immediately
            queryClient.invalidateQueries({ queryKey: ["currencies"] });
            queryClient.invalidateQueries({ queryKey: ["product"] });
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            
            // Optional: If you use a broader query key for everything, you can clear or refetch all:
            // queryClient.refetchQueries();
        },
    });
};