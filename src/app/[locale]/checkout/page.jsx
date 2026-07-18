"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCart } from "@/components/cart/hooks/useCart";
import { useCheckoutOptions, useCheckout } from "@/components/checkout/checkoutHooks";
import DeliverySection from "@/components/checkout/DeliverySection";
import PaymentSection from "@/components/checkout/PaymentSection";
import NextStepHandler from "@/components/checkout/NextStepHandler";
import { useAuthStore } from "@/lib/store";
import { getLocalePrefix } from "@/lib/locale";
import CartItem from "@/components/cart/CartItem";
import BundleCartItem from "@/components/cart/BundleCartItem";
import { toast } from "react-hot-toast";

function CheckoutPage() {
  const t = useTranslations("checkout");
  const router = useRouter();
  const pathname = usePathname();
  const localePrefix = getLocalePrefix(pathname);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data: cart, isLoading: isCartLoading } = useCart({ enabled: isAuthenticated });
  const { data: options, isLoading: isOptionsLoading } = useCheckoutOptions();

  const items = cart?.items || [];
  const deliveryMethods = options?.deliveryMethods || [];
  const stores = options?.stores || [];
  const defaultAddress = options?.defaultAddress || null;
  const paymentMethods = options?.paymentMethods || [];

  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentFields, setPaymentFields] = useState({});
  const [checkoutState, setCheckoutState] = useState("idle");
  const [orderResult, setOrderResult] = useState(null);
  const [nextStep, setNextStep] = useState(null);

  const checkoutMutation = useCheckout();

  const handlePlaceOrder = async () => {
    if (!selectedDeliveryMethod) {
      toast.error(t("error_generic"));
      return;
    }
    if (selectedDeliveryMethod.type === "delivery" && !selectedAddress) {
      toast.error(t("select_address"));
      return;
    }
    if (selectedDeliveryMethod.type === "pickup" && !selectedStore) {
      toast.error(t("select_store"));
      return;
    }
    if (!selectedPaymentMethod) {
      toast.error(t("error_generic"));
      return;
    }

    setCheckoutState("submitting");

    try {
      const res = await checkoutMutation.mutateAsync({
        delivery_method_id: selectedDeliveryMethod.id,
        payment_method_id: selectedPaymentMethod.id,
        address_id: selectedAddress?.id || null,
        store_id: selectedStore?.id || null,
        fields: paymentFields,
      });

      const result = res?.result || res;
      const order = result?.order || null;
      const nextStep = result?.next_step || null;

      if (order) setOrderResult(order);
      setNextStep(nextStep);

      if (nextStep) {
        setCheckoutState("next_step");
      } else {
        router.push(`${localePrefix}/checkout/confirmation/${order.id}`);
      }
    } catch (error) {
      toast.error(error?.response?.message || t("error_generic"));
      setCheckoutState("idle");
    }
  };

  const handleCheckoutComplete = () => {
    if (!orderResult) {
      router.push(`${localePrefix}/cart`);
      return;
    }
    router.push(`${localePrefix}/checkout/confirmation/${orderResult.id}`);
  };

  useEffect(() => {
    if (deliveryMethods.length > 0 && !selectedDeliveryMethod) {
      setSelectedDeliveryMethod(deliveryMethods[0]);
    }
  }, [deliveryMethods, selectedDeliveryMethod]);

  useEffect(() => {
    if (defaultAddress && !selectedAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [defaultAddress, selectedAddress]);

  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentMethod) {
      setSelectedPaymentMethod(paymentMethods[0]);
    }
  }, [paymentMethods, selectedPaymentMethod]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to checkout");
      router.replace(`${localePrefix}/login`);
    }
  }, [isAuthenticated, router, localePrefix]);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Don't redirect if already processing payment or showing Stripe
    if (checkoutState === "next_step" || checkoutState === "submitting") return;
    if (!isCartLoading && items.length === 0) {
      toast.error("Your cart is empty");
      router.replace(`${localePrefix}/cart`);
    }
  }, [isCartLoading, items, router, localePrefix, isAuthenticated, checkoutState]);

  if (!isAuthenticated || (!isCartLoading && items.length === 0)) {
    return null;
  }

  if (checkoutState === "submitting") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-600">{t("processing")}</p>
        </div>
      </div>
    );
  }

  if (checkoutState === "next_step" && orderResult) {
    return (
      <div className="min-h-screen pt-8 pb-16">
        <div className="container1 mx-auto px-2 max-w-lg">
          <NextStepHandler
            nextStep={nextStep}
            orderId={orderResult.id}
            onComplete={handleCheckoutComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="container1 mx-auto px-2">
        <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column — delivery, address, payment */}
          <div className="flex-1 space-y-6">
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">{t("delivery_method")}</h2>
              {isOptionsLoading ? (
                <p className="text-sm text-gray-400">{t("section_loading")}</p>
              ) : (
                <DeliverySection
                  deliveryMethods={deliveryMethods}
                  selectedDeliveryMethod={selectedDeliveryMethod}
                  onDeliveryMethodSelect={setSelectedDeliveryMethod}
                  selectedAddress={selectedAddress}
                  onAddressSelect={setSelectedAddress}
                  defaultAddress={defaultAddress}
                  stores={stores}
                  selectedStore={selectedStore}
                  onStoreSelect={setSelectedStore}
                />
              )}
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">{t("payment_method")}</h2>
              {isOptionsLoading ? (
                <p className="text-sm text-gray-400">{t("section_loading")}</p>
              ) : (
                <PaymentSection
                  paymentMethods={paymentMethods}
                  selectedPaymentMethod={selectedPaymentMethod}
                  onSelect={setSelectedPaymentMethod}
                  paymentFields={paymentFields}
                  onFieldsChange={setPaymentFields}
                />
              )}
            </div>
          </div>

          {/* Right column — order summary */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">{t("order_summary")}</h2>

              {isCartLoading ? (
                <p className="text-sm text-gray-400">{t("section_loading")}</p>
              ) : (
                <div>
                  {items.map((item) => {
                    const isBundle = item.type === "bundle" || item.isBundle === true;
                    return isBundle ? (
                      <BundleCartItem
                        key={`bundle-${item.cartItemId || item.id}`}
                        item={item}
                        readOnly
                      />
                    ) : (
                      <CartItem
                        key={`${item.cartItemId || item.id}-${item.size || ""}-${item.color || ""}`}
                        item={item}
                        readOnly
                      />
                    );
                  })}

                  <div className="border-t pt-4 mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("subtotal")}</span>
                      <span>{cart?.subtotalFormatted || cart?.totalFormatted}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t("shipping")}</span>
                      <span className="text-gray-400">{t("calculated_at_checkout")}</span>
                    </div>
                    {cart?.discountFormatted && cart.discountFormatted !== "0" && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>{t("discount")}</span>
                        <span>-{cart.discountFormatted}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>{t("total")}</span>
                      <span>{cart?.totalFormatted || "0"}</span>
                    </div>
                  </div>

                  <button
                    className="w-full bg-black text-white py-3 rounded font-bold text-lg mt-6 hover:bg-gray-900 transition disabled:opacity-50"
                    onClick={handlePlaceOrder}
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? t("processing") : t("place_order")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
