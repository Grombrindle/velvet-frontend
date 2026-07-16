"use client";
import Image from "next/image";
import Link from "next/link";
import { useOrders } from "./hooks/useGetOrders";
import Loader from "../ui/loader";
import ErrorState from "../ui/errorMessage";
import { usePathname } from "next/navigation";
import { getLocalePrefix } from "@/lib/locale";
import { useTranslations } from "next-intl";

const OrderField = ({ label, value }) => (
  <div className="flex justify-between">
    <h1 className="font-bold text-sm text-[#000000]">{label}:</h1>
    <p className="text-[#000000] text-sm">{value}</p>
  </div>
);

const OrdersGrid = () => {
  const t = useTranslations("order");

  const pathname = usePathname();

  const localePrefix = getLocalePrefix(pathname);
  const { data: orders, isLoading, error } = useOrders();

  if (isLoading) {
    return <Loader text={t("Loading_orders")} />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container4 h-screen flex justify-center items-center mx-auto mt-2">
        <div className="flex flex-col space-y-6 justify-center items-center">
          <div className="relative" style={{ width: "15rem", height: "15rem" }}>
            <Image src="/images/no order.png" fill alt="no order" />
          </div>
          <p className="text-xl text-[#525252] mb-[10rem]">{t('order_not_found')}</p>
        </div>
      </div>
    );
  }

  // Format date from API (2026-04-02T09:57:35.000000Z) to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "completed":
        return "text-blue-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="container4 mx-auto lg:mt-[1rem] mt-[7rem]">
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-[1.5rem]">
        {orders?.map((order) => (
          <div
            key={order.id}
            style={{ boxShadow: "0px 0px 28px 0px #00000040" }}
            className="w-full h-[26rem] border border-[#959595] shadow-lg p-4 flex flex-col bg-white"
          >
            <div className="space-y-4 flex-1">
              <OrderField label={t("order_no")} value={order.order_code} />
              <OrderField
                label={t("order_date")}
                value={formatDate(order.created_at)}
              />
              <OrderField
                label={t("product_quantity")}
                value={`${order.items_count} ${order.items_count === 1 ? t("piece" ): t("pieces")}`}
              />
              <OrderField
                label={t("Total")}
                value={order.total_price?.formatted || `${order.total} £`}
              />
              <div className="flex justify-end">
                <p
                  className={`font-semibold text-sm ${getStatusColor(order.status)}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </p>
              </div>
              <div className="relative w-24 h-34">
                {order.images && order.images.length > 0 ? (
                  <Image
                    src={order.images[0]}
                    alt={`Order ${order.order_code}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    {t("no_image")}
                  </div>
                )}
              </div>
              <Link href={`${localePrefix}/dashboard/orders/${order.id}`}>
                <button className="w-full h-[3rem] cursor-pointer bg-black text-white text-sm font-bold">
                  {t("ORDER_DETAILS")}
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersGrid;
