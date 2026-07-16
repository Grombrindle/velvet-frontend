"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiDelete } from "@/lib/api";
import { useFavoriteStore } from "@/lib/store"; // Import your store

export const favoritesKeys = {
    all: ['favorites'],
    paginated: (page) => ['favorites', 'paginated', page],
};

export const useFavorites = (page = 1) => {
    return useQuery({
        queryKey: favoritesKeys.paginated(page),
        queryFn: async() => {
            const response = await apiGet(`/favorites?page=${page}`);
            return {
                items: response?.result || [], // result is now the array directly
                pagination: response?.pagination || {
                    current_page: 1,
                    last_page: 1,
                    per_page: 10,
                    total: 0,
                    has_more: false
                },
                currency: response?.result?.[0]?.price?.currency_code || "USD"
            };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useDeleteFavorite = () => {
    const queryClient = useQueryClient();
    const { setFavorite } = useFavoriteStore(); // Get setFavorite from store
    
    return useMutation({
        mutationFn: async (productId) => {
            const response = await apiDelete(`/favorites/${productId}`);
            return response;
        },
        onSuccess: (data, productId) => {
            // Update Zustand store FIRST (immediate UI update)
            setFavorite(productId, false);
            
            // Update React Query cache for the product
            queryClient.setQueryData(["product", productId], (oldData) => {
                if (!oldData) return oldData;
                
                return {
                    ...oldData,
                    result: {
                        ...oldData?.result,
                        is_favorite: false
                    },
                    is_favorite: false
                };
            });
            
            // Update React Query cache for favorites list
            queryClient.setQueryData(favoritesKeys.all, (oldData) => {
                if (!oldData) return oldData;
                return oldData.filter(item => item.id !== productId);
            });
            
            // Invalidate queries to ensure sync with server
            queryClient.invalidateQueries({ queryKey: favoritesKeys.all });
            queryClient.invalidateQueries({ queryKey: ["product", productId] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};