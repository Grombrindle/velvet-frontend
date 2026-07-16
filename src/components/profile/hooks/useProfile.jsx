import { apiGet, apiPut } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useProfile = () => {
  const { user, isAuthenticated } = useAuthStore(); // Get auth state
  
  return useQuery({
    queryKey: ["profile", user?.id], // Include user ID in query key
    queryFn: async () => {
      const response = await apiGet("/auth/me");
      if (response?.success && response?.result) {
        return response.result;
      }
      return null;
    },
    enabled: !!isAuthenticated, // Only run query when authenticated
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: false, // Don't retry on auth errors
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (profileData) => {
      const response = await apiPut("/auth/update-profile", profileData);
      
      // If response is not successful, throw the error
      if (!response?.success) {
        // Throw the entire response so you can access the error details
        throw response;
      }
      
      if (response?.success && response?.result) {
        return response.result;
      }
      
      // If we get here without success, throw something
      throw new Error("Update failed");
    },
    onSuccess: (data) => {
      // Update the profile data in the cache with the specific user ID
      queryClient.setQueryData(["profile", user?.id], data);
      // Also invalidate to ensure fresh data if needed
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (error) => {
      // Make sure the error propagates to the component
      throw error;
    },
  });
};