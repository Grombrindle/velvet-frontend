// "use client";

// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
// import { useLoginModalStore } from "@/lib/store";
// import toast from "react-hot-toast";

// const CART_QUERY_KEY = ["cart"];

// /** Show a clickable toast that opens the login modal */
// function showAuthToast() {
//   toast(
//     (t) => (
//       <div
//         onClick={() => {
//           toast.dismiss(t.id);
//           useLoginModalStore.getState().open();
//         }}
//         className="cursor-pointer"
//       >
//         <p className="font-semibold">Please login to manage your cart</p>
//         <p className="text-sm underline mt-1">Click to login →</p>
//       </div>
//     ),
//     {
//       duration: 8000,
//       style: {
//         background: "#1E293B",
//         color: "#fff",
//         borderRadius: "12px",
//         padding: "16px",
//       },
//     },
//   );
// }


// function toNumber(value, fallback = 0) {
//   const parsed = Number(value);
//   return Number.isFinite(parsed) ? parsed : fallback;
// }

// function pickFirst(...values) {
//   return values.find((value) => value !== undefined && value !== null);
// }

// function getCartPayload(response) {
//   return response?.result || response?.data || response || {};
// }

// function getCartItems(payload) {
//   const candidates = [
//     payload?.items,
//     payload?.cart_items,
//     payload?.cart?.items,
//     payload?.cart?.cart_items,
//     payload?.data?.items,
//   ];

//   return candidates.find(Array.isArray) || [];
// }

// function normalizePrice(priceSource, fallbackCurrency = "USD") {
//   if (typeof priceSource === "number" || typeof priceSource === "string") {
//     const amount = toNumber(priceSource);
//     return {
//       amount,
//       formatted: `${amount.toLocaleString()} ${fallbackCurrency}`,
//       currency: fallbackCurrency,
//     };
//   }

//   const amount = toNumber(
//     pickFirst(
//       priceSource?.amount,
//       priceSource?.value,
//       priceSource?.raw,
//       priceSource?.price,
//     ),
//   );

//   const currency = pickFirst(
//     priceSource?.currency_code,
//     priceSource?.currency,
//     fallbackCurrency,
//   );

//   return {
//     amount,
//     formatted: priceSource?.formatted || `${amount.toLocaleString()} ${currency}`,
//     currency,
//   };
// }

// function normalizeCartItem(item) {
//   const isBundle = item?.type === 'bundle';
//   const color = item?.primary_color || {};
//   const size = item?.selected_size || {};
//   const image =
//     pickFirst(
//       item?.images?.[0],
//       color?.main_image,
//     ) || "/images/600x800.png";

//   const base = {
//     id: item?.id,
//     cartItemId: item?.cart_item_id,
//     productId: item?.product_id,
//     quantity: toNumber(item?.quantity, 1),
//     name: item?.name || "Product",
//     image,
//     colorId: color?.id,
//     color: color?.name || null,
//     sizeId: size?.id,
//     size: size?.name || null,
//     price: normalizePrice(item?.price),
//     subtotal: normalizePrice(item?.subtotal_before_discount),
//     discount: normalizePrice(item?.discount_amount),
//     total: normalizePrice(item?.total_after_discount),
//     type: item?.type || 'simple',
//     isDiscountAvailable: item?.is_discount_available ?? false,
//     isFree: item?.is_free ?? false,
//     raw: item,
//   };

//   if (isBundle && item?.bundles) {
//     return {
//       ...base,
//       bundleName: item?.bundle_name || item?.name,
//       bundlePrice: normalizePrice(item?.bundle_price || item?.price),
//       bundleItems: item.bundles.map((child) => ({
//         ...normalizeCartItem(child),
//         isBundleChild: true,
//         parentCartItemId: item?.cart_item_id,
//       })),
//     };
//   }

//   return base;
// }

// function normalizeCart(response) {
//   const payload = getCartPayload(response);
//   // First pass: normalize all items (bundle parents + children + simple items)
//   const allNormalized = getCartItems(payload).map(normalizeCartItem);
//   // Second pass: keep only parent items (bundle children are nested under their parent)
//   const items = allNormalized.filter((item) => !item.isBundleChild);
//   const totals = payload?.totals || {};
//   const totalCount =
//     toNumber(payload?.number_of_items) ||
//     toNumber(totals?.item_count) ||
//     items.reduce((sum, item) => sum + item.quantity, 0);

//   const total = normalizePrice(totals?.total_after_discount);
//   const subtotal = normalizePrice(totals?.subtotal_before_discount);
//   const discount = normalizePrice(totals?.discount_amount);

//   return {
//     items,
//     totalCount,
//     totalPrice: total.amount,
//     totalFormatted: total.formatted,
//     currency: total.currency,
//     subtotalFormatted: subtotal.formatted,
//     discountFormatted: discount.formatted,
//     cartId: payload?.cart_id,
//     userCurrency: payload?.user_currency,
//     raw: payload,
//   };
// }

// async function cancelAndSnapshot(queryClient) {
//   await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
//   return queryClient.getQueryData(CART_QUERY_KEY);
// }

// function setOptimisticCart(queryClient, updater) {
//   queryClient.setQueryData(CART_QUERY_KEY, (current) => {
//     const base = current || {
//       items: [],
//       totalCount: 0,
//       totalPrice: 0,
//       totalFormatted: "0",
//       currency: "",
//       raw: {},
//     };

//     const next = updater(base);
//     const nextItems = next.items || base.items;
//     const nextTotalCount =
//       next.totalCount ??
//       nextItems.reduce((sum, item) => sum + item.quantity, 0);
//     const nextTotalPrice =
//       next.totalPrice ??
//       nextItems.reduce((sum, item) => sum + item.price.amount * item.quantity, 0);

//     return {
//       ...base,
//       ...next,
//       items: nextItems,
//       totalCount: nextTotalCount,
//       totalPrice: nextTotalPrice,
//       totalFormatted:
//         next.totalFormatted ||
//         `${nextTotalPrice.toLocaleString()} ${base.currency || ""}`.trim(),
//     };
//   });
// }

// export function useCart(options = {}) {
//   return useQuery({
//     queryKey: CART_QUERY_KEY,
//     queryFn: async () => normalizeCart(await apiGet("/cart")),
//     staleTime: 30 * 1000,
//     ...options,
//   });
// }

// export function useAddToCart() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({
//       product_id,
//       quantity = 1,
//       colors_id,
//       sizes_id,
//     }) =>
//       apiPost("/cart/items", {
//         product_id,
//         quantity,
//         colors_id: Array.isArray(colors_id) ? colors_id : [colors_id],
//         sizes_id: Array.isArray(sizes_id) ? sizes_id : [sizes_id],
//       }),
//     onMutate: async (variables) => {
//       const previousCart = await cancelAndSnapshot(queryClient);

//       // Detect bundle: if colors_id/sizes_id have more than 1 element
//       const isBundle =
//         Array.isArray(variables.colors_id) && variables.colors_id.length > 1;

//       if (isBundle) {
//         // Skip optimistic update for bundles — complex structure, just invalidate
//         return { previousCart: null, skippedOptimistic: true };
//       }

//       const quantity = toNumber(variables.quantity, 1);
//       const optimisticId = `temp-${Date.now()}`;
//       const colorId = Array.isArray(variables.colors_id)
//         ? variables.colors_id[0]
//         : variables.colors_id;
//       const sizeId = Array.isArray(variables.sizes_id)
//         ? variables.sizes_id[0]
//         : variables.sizes_id;

//       setOptimisticCart(queryClient, (cart) => {
//         const existingIndex = cart.items.findIndex(
//           (item) =>
//             item.productId === variables.product_id &&
//             item.colorId === colorId &&
//             item.sizeId === sizeId,
//         );

//         if (existingIndex >= 0) {
//           return {
//             items: cart.items.map((item, index) =>
//               index === existingIndex
//                 ? { ...item, quantity: item.quantity + quantity }
//                 : item,
//             ),
//           };
//         }

//         return {
//           items: [
//             {
//               id: optimisticId,
//               productId: variables.product_id,
//               quantity,
//               name: variables.product_name || "Product",
//               image: variables.image || "/images/600x800.png",
//               colorId,
//               color: variables.color_name,
//               sizeId,
//               size: variables.size_name,
//               price: normalizePrice(variables.price, variables.currency),
//               total: normalizePrice(
//                 toNumber(variables.price) * quantity,
//                 variables.currency,
//               ),
//               raw: null,
//             },
//             ...cart.items,
//           ],
//         };
//       });

//       return { previousCart };
//     },
//     onError: (error, _variables, context) => {
//       // Handle auth errors (401) with a user-friendly message + login modal
//       if (error.status === 401) {
//         showAuthToast();
//         return;
//       }

//       if (context?.skippedOptimistic) {
//         // For bundles, just show error — no cart state to roll back
//         toast.error(error?.response?.message || "Failed to add bundle to cart");
//         return;
//       }
//       if (context?.previousCart) {
//         queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
//       }
//       toast.error(error?.response?.message || "Failed to add item to cart");
//     },
//     onSuccess: () => {
//       toast.success("Item added to cart successfully!");
//     },
//     onSettled: async () => {
//       await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
//     },
//   });
// }

// export function useUpdateCartItemQuantity() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ itemId, quantity }) =>
//       apiPut(`/cart/items/${itemId}`, { quantity }),
//     onMutate: async ({ itemId, quantity }) => {
//       const previousCart = await cancelAndSnapshot(queryClient);

//       setOptimisticCart(queryClient, (cart) => ({
//         items: cart.items.map((item) =>
//           (item.cartItemId || item.id) === itemId ? { ...item, quantity: toNumber(quantity, 1) } : item,
//         ),
//       }));

//       return { previousCart };
//     },
//     onError: (error, _variables, context) => {
//       if (error.status === 401) {
//         showAuthToast();
//         return;
//       }
//       if (context?.previousCart) {
//         queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
//       }
//       toast.error("Failed to update cart item quantity");
//     },
//     onSettled: async () => {
//       await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
//     },
//   });
// }

// export function useRemoveCartItem() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (itemId) => apiDelete(`/cart/items/${itemId}`),
//     onMutate: async (itemId) => {
//       const previousCart = await cancelAndSnapshot(queryClient);

//       setOptimisticCart(queryClient, (cart) => ({
//         items: cart.items.filter(
//           (item) => (item.cartItemId || item.id) !== itemId,
//         ),
//       }));

//       return { previousCart };
//     },
//     onError: (error, _variables, context) => {
//       if (error.status === 401) {
//         showAuthToast();
//         return;
//       }
//       if (context?.previousCart) {
//         queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
//       }
//       toast.error("Failed to remove item from cart");
//     },
//     onSettled: async () => {
//       await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
//     },
//   });
// }

// export function useClearCart() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async () => apiDelete("/cart"),
//     onMutate: async () => {
//       const previousCart = await cancelAndSnapshot(queryClient);
//       queryClient.setQueryData(CART_QUERY_KEY, {
//         items: [],
//         totalCount: 0,
//         totalPrice: 0,
//         totalFormatted: "0",
//         currency: "",
//         raw: {},
//       });

//       return { previousCart };
//     },
//     onError: (error, _variables, context) => {
//       if (error.status === 401) {
//         showAuthToast();
//         return;
//       }
//       if (context?.previousCart) {
//         queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
//       }
//       toast.error("Failed to clear cart");
//     },
//     onSettled: async () => {
//       await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
//     },
//   });
// }
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { useLoginModalStore } from "@/lib/store";
import toast from "react-hot-toast";

const CART_QUERY_KEY = ["cart"];

/** Show a clickable toast that opens the login modal */
function showAuthToast() {
  toast(
    (t) => (
      <div
        onClick={() => {
          toast.dismiss(t.id);
          useLoginModalStore.getState().open();
        }}
        className="cursor-pointer"
      >
        <p className="font-semibold">Please login to manage your cart</p>
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
}


function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function pickFirst(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function getCartPayload(response) {
  return response?.result || response?.data || response || {};
}

function getCartItems(payload) {
  const candidates = [
    payload?.items,
    payload?.cart_items,
    payload?.cart?.items,
    payload?.cart?.cart_items,
    payload?.data?.items,
  ];

  return candidates.find(Array.isArray) || [];
}

function normalizePrice(priceSource, fallbackCurrency = "USD") {
  if (typeof priceSource === "number" || typeof priceSource === "string") {
    const amount = toNumber(priceSource);
    return {
      amount,
      formatted: `${amount.toLocaleString()} ${fallbackCurrency}`,
      currency: fallbackCurrency,
    };
  }

  const amount = toNumber(
    pickFirst(
      priceSource?.amount,
      priceSource?.value,
      priceSource?.raw,
      priceSource?.price,
    ),
  );

  const currency = pickFirst(
    priceSource?.currency_code,
    priceSource?.currency,
    fallbackCurrency,
  );

  return {
    amount,
    formatted: priceSource?.formatted || `${amount.toLocaleString()} ${currency}`,
    currency,
  };
}

function normalizeCartItem(item) {
  const isBundle = item?.type === 'bundle';
  const color = item?.primary_color || {};
  const size = item?.selected_size || {};
  const image =
    pickFirst(
      item?.images?.[0],
      color?.main_image,
    ) || "/images/600x800.png";

  const base = {
    id: item?.id,
    cartItemId: item?.cart_item_id,
    productId: item?.product_id,
    quantity: toNumber(item?.quantity, 1),
    name: item?.name || "Product",
    image,
    colorId: color?.id,
    color: color?.name || null,
    sizeId: size?.id,
    size: size?.name || null,
    price: normalizePrice(item?.price),
    subtotal: normalizePrice(item?.subtotal_before_discount),
    discount: normalizePrice(item?.discount_amount),
    total: normalizePrice(item?.total_after_discount),
    type: item?.type || 'simple',
    isDiscountAvailable: item?.is_discount_available ?? false,
    isFree: item?.is_free ?? false,
    raw: item,
  };

  if (isBundle && item?.bundles) {
    return {
      ...base,
      bundleName: item?.bundle_name || item?.name,
      bundlePrice: normalizePrice(item?.bundle_price || item?.price),
      bundleItems: item.bundles.map((child) => ({
        ...normalizeCartItem(child),
        isBundleChild: true,
        parentCartItemId: item?.cart_item_id,
      })),
    };
  }

  return base;
}

function normalizeCart(response) {
  const payload = getCartPayload(response);
  // First pass: normalize all items (bundle parents + children + simple items)
  const allNormalized = getCartItems(payload).map(normalizeCartItem);
  // Second pass: keep only parent items (bundle children are nested under their parent)
  const items = allNormalized.filter((item) => !item.isBundleChild);
  const totals = payload?.totals || {};
  const totalCount =
    toNumber(payload?.number_of_items) ||
    toNumber(totals?.item_count) ||
    items.reduce((sum, item) => sum + item.quantity, 0);

  const total = normalizePrice(totals?.total_after_discount);
  const subtotal = normalizePrice(totals?.subtotal_before_discount);
  const discount = normalizePrice(totals?.discount_amount);

  return {
    items,
    totalCount,
    totalPrice: total.amount,
    totalFormatted: total.formatted,
    currency: total.currency,
    subtotalFormatted: subtotal.formatted,
    discountFormatted: discount.formatted,
    cartId: payload?.cart_id,
    userCurrency: payload?.user_currency,
    raw: payload,
  };
}

async function cancelAndSnapshot(queryClient) {
  await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
  return queryClient.getQueryData(CART_QUERY_KEY);
}

function setOptimisticCart(queryClient, updater) {
  queryClient.setQueryData(CART_QUERY_KEY, (current) => {
    const base = current || {
      items: [],
      totalCount: 0,
      totalPrice: 0,
      totalFormatted: "0",
      currency: "",
      raw: {},
    };

    const next = updater(base);
    const nextItems = next.items || base.items;
    const nextTotalCount =
      next.totalCount ??
      nextItems.reduce((sum, item) => sum + item.quantity, 0);
    const nextTotalPrice =
      next.totalPrice ??
      nextItems.reduce((sum, item) => sum + item.price.amount * item.quantity, 0);

    return {
      ...base,
      ...next,
      items: nextItems,
      totalCount: nextTotalCount,
      totalPrice: nextTotalPrice,
      totalFormatted:
        next.totalFormatted ||
        `${nextTotalPrice.toLocaleString()} ${base.currency || ""}`.trim(),
    };
  });
}

export function useCart(options = {}) {
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => normalizeCart(await apiGet("/cart")),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useAddToCart(locale = "ar") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      product_id,
      quantity = 1,
      colors_id,
      sizes_id,
    }) =>
      apiPost("/cart/items", {
        product_id,
        quantity,
        colors_id: Array.isArray(colors_id) ? colors_id : [colors_id],
        sizes_id: Array.isArray(sizes_id) ? sizes_id : [sizes_id],
      }),
    onMutate: async (variables) => {
      const previousCart = await cancelAndSnapshot(queryClient);

      // Detect bundle: if colors_id/sizes_id have more than 1 element
      const isBundle =
        Array.isArray(variables.colors_id) && variables.colors_id.length > 1;

      if (isBundle) {
        // Skip optimistic update for bundles — complex structure, just invalidate
        return { previousCart: null, skippedOptimistic: true };
      }

      const quantity = toNumber(variables.quantity, 1);
      const optimisticId = `temp-${Date.now()}`;
      const colorId = Array.isArray(variables.colors_id)
        ? variables.colors_id[0]
        : variables.colors_id;
      const sizeId = Array.isArray(variables.sizes_id)
        ? variables.sizes_id[0]
        : variables.sizes_id;

      setOptimisticCart(queryClient, (cart) => {
        const existingIndex = cart.items.findIndex(
          (item) =>
            item.productId === variables.product_id &&
            item.colorId === colorId &&
            item.sizeId === sizeId,
        );

        if (existingIndex >= 0) {
          return {
            items: cart.items.map((item, index) =>
              index === existingIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            ),
          };
        }

        return {
          items: [
            {
              id: optimisticId,
              productId: variables.product_id,
              quantity,
              name: variables.product_name || "Product",
              image: variables.image || "/images/600x800.png",
              colorId,
              color: variables.color_name,
              sizeId,
              size: variables.size_name,
              price: normalizePrice(variables.price, variables.currency),
              total: normalizePrice(
                toNumber(variables.price) * quantity,
                variables.currency,
              ),
              raw: null,
            },
            ...cart.items,
          ],
        };
      });

      return { previousCart };
    },
    onError: (error, _variables, context) => {
      // Handle auth errors (401) with a user-friendly message + login modal
      if (error.status === 401) {
        showAuthToast();
        return;
      }

      if (context?.skippedOptimistic) {
        // For bundles, just show error — no cart state to roll back
        toast.error(
          locale === "en"
            ? "Failed to add bundle to cart"
            : "فشل إضافة الباقة إلى السلة"
        );
        return;
      }
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
      toast.error(
        locale === "en"
          ? error?.response?.message || "Failed to add item to cart"
          : error?.response?.message || "فشل إضافة المنتج إلى السلة"
      );
    },
    onSuccess: () => {
      toast.success(
        locale === "en"
          ? "Item added to cart successfully!"
          : "تم إضافة المنتج إلى السلة بنجاح!"
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }) =>
      apiPut(`/cart/items/${itemId}`, { quantity }),
    onMutate: async ({ itemId, quantity }) => {
      const previousCart = await cancelAndSnapshot(queryClient);

      setOptimisticCart(queryClient, (cart) => ({
        items: cart.items.map((item) =>
          (item.cartItemId || item.id) === itemId ? { ...item, quantity: toNumber(quantity, 1) } : item,
        ),
      }));

      return { previousCart };
    },
    onError: (error, _variables, context) => {
      if (error.status === 401) {
        showAuthToast();
        return;
      }
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
      toast.error("Failed to update cart item quantity");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId) => apiDelete(`/cart/items/${itemId}`),
    onMutate: async (itemId) => {
      const previousCart = await cancelAndSnapshot(queryClient);

      setOptimisticCart(queryClient, (cart) => ({
        items: cart.items.filter(
          (item) => (item.cartItemId || item.id) !== itemId,
        ),
      }));

      return { previousCart };
    },
    onError: (error, _variables, context) => {
      if (error.status === 401) {
        showAuthToast();
        return;
      }
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
      toast.error("Failed to remove item from cart");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => apiDelete("/cart"),
    onMutate: async () => {
      const previousCart = await cancelAndSnapshot(queryClient);
      queryClient.setQueryData(CART_QUERY_KEY, {
        items: [],
        totalCount: 0,
        totalPrice: 0,
        totalFormatted: "0",
        currency: "",
        raw: {},
      });

      return { previousCart };
    },
    onError: (error, _variables, context) => {
      if (error.status === 401) {
        showAuthToast();
        return;
      }
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
      toast.error("Failed to clear cart");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}