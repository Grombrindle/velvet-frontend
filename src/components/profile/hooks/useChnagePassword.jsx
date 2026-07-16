import { apiPost } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export const useResetPassword = () => {
    return useMutation({
        mutationFn: async(passwordData) => {
            const response = await apiPost("/auth/reset-password", passwordData);
            
            // ✅ Check for success without requiring 'result'
            if (response?.success === true) {
                return response; // or return response.message if you want
            }
            
            // Throw error only when success is false
            throw new Error(response?.message || "Failed to change password");
        },
    });
};