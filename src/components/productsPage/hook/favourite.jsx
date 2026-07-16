import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";
import { useLoginModalStore } from "@/lib/store";
import toast from "react-hot-toast";
export { useAddToCart } from "@/components/cart/hooks/useCart";

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId) => {
      const response = await apiPost(`/favorites/${productId}`);
      return response;
    },
    onSuccess: (data, productId) => {
      // Simple invalidation approach - let React Query handle the refetching
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: (error) => {
      if (error.status === 401) {
        toast(
          (t) => (
            <div
              onClick={() => {
                toast.dismiss(t.id);
                useLoginModalStore.getState().open();
              }}
              className="cursor-pointer"
            >
              <p className="font-semibold">Please login to add to favorites</p>
              <p className="text-sm underline mt-1">Click to login →</p>
            </div>
          ),
          {
            duration: 8000,
            style: {
              background: "#1E293B",
              color: "#fff",
              borderRadius: "12px",
              padding: "16px",
            },
          },
        );
        return;
      }
      toast.error("Failed to update favorite");
    }
  });
};
