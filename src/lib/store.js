import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import Cookies from "js-cookie";

export const useCartStore = create((set, get) => ({
    items: [],

    addItem: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
            const updatedItems = currentItems.map((item) =>
                item.id === product.id ? {...item, quantity: (item.quantity || 1) + 1 } :
                item,
            );
            set({ items: updatedItems });
        } else {
            set({ items: [...currentItems, {...product, quantity: 1 }] });
        }
    },

    removeItem: (id) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === id);

        if (existingItem?.quantity > 1) {
            set({
                items: currentItems.map((item) =>
                    item.id === id ? {...item, quantity: item.quantity - 1 } : item,
                ),
            });
        } else {
            set({ items: currentItems.filter((item) => item.id !== id) });
        }
    },

    deleteItem: (id) =>
        set({ items: get().items.filter((item) => item.id !== id) }),

    getTotalCount: () => {
        return get().items.reduce((total, item) => total + (item.quantity || 0), 0);
    },

    getTotalPrice: () => {
        const items = get().items;
        return items.reduce((acc, item) => {
            // Ensure price is a number (handles strings like "1500" from APIs)
            const price = parseFloat(item.price.amount);
            return acc + price * item.quantity;
        }, 0);
    },
}));

export const useCategoryPageStore = create((set) => ({
    isFilterOpen: false,
    viewMode: 3,
    columns: 4,

    setViewMode: (num) => set({ viewMode: num }),
    toggleFilter: () => set((state) => ({ isFilterOpen: !state.isFilterOpen })),
    setColumns: (num) => set({ columns: num }),
}));

const cookieStorage = {
    getItem: (name) => {
        const cookie = Cookies.get(name);
        return cookie ? cookie : null;
    },
    setItem: (name, value) => {
        Cookies.set(name, value, { expires: 7, secure: true, sameSite: "strict" });
    },
    removeItem: (name) => {
        Cookies.remove(name);
    },
};

export const useAuthStore = create(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            _hasHydrated: false,

            setAuth: (data) => {
                set({
                    token: data.token,
                    user: data.user || data,
                    isAuthenticated: true,
                });
            },

            clear: () => {
                set({ token: null, user: null, isAuthenticated: false });
            },

            setHasHydrated: (value) => {
                set({ _hasHydrated: value });
            },
        }), {
            name: "auth-storage",
            storage: createJSONStorage(() => cookieStorage),
            onRehydrateStorage: () => {
                return (state) => {
                    if (state) state.setHasHydrated(true);
                };
            },
        },
    ),
);

export const useFaqStore = create((set) => ({
    selectedCategory: null,
    setCategory: (category) => set({ selectedCategory: category }),
}));
export const useAddressUIStore = create((set) => ({
    selectedAddress: null,
    addFormOpen: false,
    editFormOpen: false,
    selectedCountryId: "", // Changed from selectedGovId

    openAddForm: () =>
        set({
            addFormOpen: true,
            editFormOpen: false,
            selectedAddress: null,
            selectedCountryId: "", // Reset when opening add form
        }),

    openEditForm: (address) =>
        set({
            editFormOpen: true,
            addFormOpen: false,
            selectedAddress: address,
            selectedCountryId: address?.country?.id?.toString() || "", // Changed from governorate to country
        }),

    closeForms: () =>
        set({
            addFormOpen: false,
            editFormOpen: false,
            selectedAddress: null,
            selectedCountryId: "", // Reset when closing forms
        }),

    // Add a method to update selectedCountryId
    setSelectedCountryId: (countryId) =>
        set({
            selectedCountryId: countryId,
        }),
}));
export const useLoginModalStore = create((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export const useFavoriteStore = create(
    persist(
        (set, get) => ({
            favorites: {},

            toggleFavorite: (productId) => {
                const currentFavorites = get().favorites;
                const newFavoriteState = !currentFavorites[productId];

                set({
                    favorites: {
                        ...currentFavorites,
                        [productId]: newFavoriteState
                    }
                });

                return newFavoriteState;
            },

            setFavorite: (productId, value) => {
                set({
                    favorites: {
                        ...get().favorites,
                        [productId]: value
                    }
                });
            },

            isFavorite: (productId) => {
                return get().favorites[productId] || false;
            }
        }), {
            name: "favorites-storage",
            storage: createJSONStorage(() => cookieStorage),
        }
    )
);
