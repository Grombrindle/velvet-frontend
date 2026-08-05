import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/notifications";

export const notificationsQueryKey = (page = 1) => ["notifications", "list", page];

// Paginated notification list for the bell dropdown
export const useNotifications = (page = 1, size = 20, options = {}) => {
  return useQuery({
    queryKey: notificationsQueryKey(page),
    queryFn: () => fetchNotifications({ page, size }),
    staleTime: 1000 * 60, // 1 min
    ...options,
  });
};

// User notification preferences (enabled / sound)
export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ["notifications", "preferences"],
    queryFn: fetchNotificationPreferences,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => updateNotificationPreferences(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "preferences"] });
    },
  });
};
