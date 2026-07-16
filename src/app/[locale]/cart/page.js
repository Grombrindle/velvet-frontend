"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import CartItem from "@/components/cart/CartItem";
import BundleCartItem from "@/components/cart/BundleCartItem";
import CartSummary from "@/components/cart/CartSummary";
import { getLocalePrefix } from "@/lib/locale";
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItemQuantity,
} from "@/components/cart/hooks/useCart";
import { Toaster, toast } from "react-hot-toast";

function CartPage() {
  const t = useTranslations("cart");
  const router = useRouter();
  const pathname = usePathname();
  const localePrefix = getLocalePrefix(pathname);
  const { data: cart, isLoading } = useCart();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();
  const { mutate: updateQuantity, isPending: isUpdatingQuantity } =
    useUpdateCartItemQuantity();
  const { mutate: clearCart, isPending: isClearingCart } = useClearCart();
  const items = cart?.items || [];

  const handleQuantityChange = (item, quantity) => {
    updateQuantity({ itemId: item.id, quantity });
  };

  const handleCheckout = () => {
    if (isLoading) return;
    if (items.length === 0) {
      toast.error(t("emptyCart"));
      return;
    }
    router.push(`${localePrefix}/checkout`);
  };

  return (
    <div className=" min-h-screen pt-8 pb-16">
      <Toaster position="top-right" />
      <div className="container1 mx-auto px-2">
        <div className="bg-[#F6F6F6] text-center py-4 text-black/70 text-sm rounded mb-8">
          {t("deliveryNotice")}
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 bg-white border rounded-lg p-6 min-w-0">
            <div className="flex justify-between items-center mb-6">
              <div className="text-2xl font-bold">{t("myCart")}</div>
              <div className="flex items-center gap-4">
                {items.length > 0 && (
                  <button
                    className="text-xs underline text-black/60 disabled:opacity-50"
                    onClick={() => clearCart()}
                    disabled={isClearingCart}
                  >
                    {t("clearCart")}
                  </button>
                )}
                <Link href={`${localePrefix}/`} className="text-xs underline text-black/60">
                  {t("backToShopping")}
                </Link>
              </div>
            </div>

            <div>
              {isLoading ? (
                <div className="text-center text-black/50 py-16">{t("loadingCart")}</div>
              ) : items.length === 0 ? (
                <div className="text-center text-black/50 py-16">
                  {t("emptyCart")}
                </div>
              ) : (
                items.map((item) => {
                  const isBundle = item.type === 'bundle' || item.isBundle === true;
                  return isBundle ? (
                    <BundleCartItem
                      key={`bundle-${item.cartItemId || item.id}`}
                      item={item}
                      onRemove={() => removeItem(item.id)}
                      onQuantityChange={(qty) => handleQuantityChange(item, qty)}
                      disabled={isRemoving || isUpdatingQuantity}
                    />
                  ) : (
                    <CartItem
                      key={`${item.cartItemId || item.id}-${item.size || ""}-${item.color || ""}`}
                      item={item}
                      onRemove={() => removeItem(item.id)}
                      onQuantityChange={(qty) => handleQuantityChange(item, qty)}
                      disabled={isRemoving || isUpdatingQuantity}
                    />
                  );
                })
              )}
            </div>
          </div>

          <div className="w-full lg:w-92.5 shrink-0">
            <CartSummary
              totalCount={cart?.totalCount || 0}
              totalFormatted={cart?.totalFormatted || "0"}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
