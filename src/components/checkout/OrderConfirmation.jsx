"use client";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useOrder } from "@/components/orders/hooks/useGetOrders";
import { getLocalePrefix } from "@/lib/locale";
import Image from "next/image";

function OrderConfirmation({ orderId }) {
  const t = useTranslations("checkout");
  const ct = useTranslations("cart");
  const router = useRouter();
  const pathname = usePathname();
  const localePrefix = getLocalePrefix(pathname);
  const { data: res, isLoading, error } = useOrder(orderId);

  const order = res?.result || res;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-600">{t("processing")}</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-500">{t("error_generic")}</p>
          <button
            className="underline text-sm text-black"
            onClick={() => router.push(`${localePrefix}/`)}
          >
            {t("continue_shopping")}
          </button>
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const subtotal = order.pricing?.subtotal?.formatted;
  const shipping = order.pricing?.shipping?.formatted;
  const discount = order.pricing?.discount?.formatted;
  const total = order.pricing?.total?.formatted;

  return (
    <div className="min-h-screen lg:pt-8 pt-[6rem] pb-16">
      <div className="container1 mx-auto px-2 max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">{t("order_success")}</h1>
          <p className="text-gray-500 mt-2">
            {t("order_number")}:{" "}
            <span className="font-semibold text-black">
              {order.order_code || orderId}
            </span>
          </p>
        </div>

        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">{t("order_summary")}</h2>

          <div className="divide-y">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <div className="relative w-20 h-24 shrink-0 rounded overflow-hidden bg-gray-100">
                  {item.image || item.images?.[0] ? (
                    <Image
                      src={item.image || item.images[0]}
                      alt={item.product_name || item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="font-semibold text-sm">
                      {item.product_name || item.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {ct("quantity")}: {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-sm">
                    {item.total?.formatted ||
                      `${item.unit_price?.amount || ""} ${item.unit_price?.currency_code || ""}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("subtotal")}</span>
              <span>{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t("shipping")}</span>
              <span>{shipping}</span>
            </div>
            {discount && discount !== "0 SYP" && discount !== "0" && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{t("discount")}</span>
                <span>-{discount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>{t("total")}</span>
              <span>{total}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">
            {t("delivery_method")} & {t("payment_method")}
          </h2>
          {order.delivery_method && (
            <div className="mb-2">
              <span className="font-semibold text-sm">
                {t("delivery_method")}:{" "}
              </span>
              <span className="text-sm">
                {order.delivery_method?.name || order.delivery_method}
              </span>
            </div>
          )}
          {order.payment_method && (
            <div className="mb-2">
              <span className="font-semibold text-sm">
                {t("payment_method")}:{" "}
              </span>
              <span className="text-sm">
                {order.payment_method?.name || order.payment_method}
              </span>
            </div>
          )}
          {order.address && (
            <div className="mt-3 pt-3 border-t">
              <p className="font-semibold text-sm mb-1">
                {t("delivery")}
              </p>
              <p className="text-sm text-gray-600">
                {order.address.name} {order.address.sur_name}
                {order.address.country?.name && `, ${order.address.country.name}`}
                {order.address.city?.name && `, ${order.address.city.name}`}
                {order.address.address && `, ${order.address.address}`}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            className="flex-1 bg-black text-white py-3 rounded font-bold hover:bg-gray-900 transition"
            onClick={() => router.push(`${localePrefix}/`)}
          >
            {t("continue_shopping")}
          </button>
          <button
            className="flex-1 border border-black text-black py-3 rounded font-bold hover:bg-gray-50 transition"
            onClick={() =>
              router.push(`${localePrefix}/dashboard/orders/${orderId}`)
            }
          >
            {t("view_order")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;
