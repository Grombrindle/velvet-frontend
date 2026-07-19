"use client";
import Image from "next/image";
import Link from "next/link";
import { useOrders } from "./hooks/useGetOrders";
import Loader from "../ui/loader";
import ErrorState from "../ui/errorMessage";
import { usePathname } from "next/navigation";
import { getLocalePrefix } from "@/lib/locale";
import { useTranslations } from "next-intl";
import { useState } from "react";

const OrderField = ({ label, value }) => (
  <div className="flex justify-between">
    <h1 className="font-bold text-sm text-[#000000]">{label}:</h1>
    <p className="text-[#000000] text-sm">{value}</p>
  </div>
);

// Image Slider Component
const ImageSlider = ({ images, orderCode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-34 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
        No image
      </div>
    );
  }

  const goToPrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index, e) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full h-34">
      <Image
        src={images[currentIndex]}
        alt={`Order ${orderCode} - Image ${currentIndex + 1}`}
        fill
        className="object-contain"
      />

      {/* Navigation Arrows - Only show if more than 1 image */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-all duration-200"
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            onClick={goToNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-all duration-200"
            aria-label="Next image"
          >
            ›
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToSlide(index, e)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "bg-white w-3"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>

          {/* Image counter */}
          <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
            {currentIndex + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
};

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
            <div className="space-y-4 flex-1 flex flex-col">
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
              
              {/* Image Slider */}
              <ImageSlider images={order.images} orderCode={order.order_code} />
              
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