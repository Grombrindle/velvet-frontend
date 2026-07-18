"use client";
import { useState } from "react";
import { OrderProgress } from "@/components/orders/orderProgress";
import Image from "next/image";
import OrderCancell from "./orderCancell";
import { useOrder } from "./hooks/useGetOrders";
import Loader from "../ui/loader";
import ErrorState from "../ui/errorMessage";
import { useLocale, useTranslations } from "next-intl";

// Reusable InfoRow component
const InfoRow = ({ label, value }) => (
  <div className="flex gap-x-2 space-y-3">
    <h1 className="text-[#000000] font-bold text-md">{label}:</h1>
    <p className="text-[#000000]">{value}</p>
  </div>
);

// Reusable Product Attribute component
const ProductAttribute = ({ label, value }) => (
  value && (
    <p className="text-md font-bold text-[#333]">
      {label}: <span className="font-normal">{value}</span>
    </p>
  )
);

// Reusable Product Item component (handles both simple and bundle items)
const ProductItem = ({ item, t }) => {
  const isBundle = item?.type === 'bundle';
  const image = item?.image || item?.images?.[0];
  const itemName = item?.product_name || item?.name;

  return (
    <div className={isBundle ? "border-2 border-blue-100 rounded-lg p-3 mb-3" : ""}>
      {/* Bundle header with children indicator */}
      {isBundle && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
            {t("bundle")}
          </span>
          <span className="text-sm text-gray-500">
            {item.bundle_name || itemName}
          </span>
        </div>
      )}

      {/* Main item display (works for both bundle and simple) */}
      <div className="flex gap-x-4 pb-4">
        <div className="relative w-24 h-32">
          {image ? (
            <Image
              src={image}
              alt={itemName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between">
          <h1 className="font-bold text-[#000000] text-lg">
            {itemName}
          </h1>

          <ProductAttribute label={t("Color")} value={item.color} />
          <ProductAttribute label={t("Size")} value={item.size} />
          <ProductAttribute label={t("Quantity")} value={item.quantity} />

          <p className="font-bold text-md text-[#333]">
            {item.total?.formatted || `${item.unit_price?.amount} ${item.unit_price?.currency_code}`}
          </p>
        </div>
      </div>

      {/* Nested children (for bundles only) */}
      {isBundle && item.bundles?.length > 0 && (
        <div className="ml-8 border-t pt-3 space-y-3">
          <p className="text-sm font-semibold text-gray-500">{t("bundle_items")}:</p>
          {item.bundles.map((child, idx) => (
            <div key={idx} className="flex gap-x-3">
              <div className="relative w-16 h-20 shrink-0">
                {child.image ? (
                  <Image src={child.image} alt={child.product_name || child.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{child.product_name || child.name}</p>
                <p className="text-xs text-gray-500">{child.color}, {child.size}</p>
                <p className="text-xs text-gray-500">{t("Quantity")}: {child.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Reusable Address component
const DeliveryAddress = ({ address, t }) => (
  <div className="w-full h-auto border border-[#D4D4D4] rounded-md mt-5 p-4">
    <h1 className="font-bold text-md text-[#000000]">{t("ORDER_DETAILS")}</h1>

    <h1 className="font-bold text-md text-[#000000] mt-4">
      {t("delivery_address")}
    </h1>
    <p className="text-[#000000] text-md mt-2">
      {address
        ? `${address.name || ""} ${address.sur_name || ""}, ${address.country?.name || ""}, ${address.city?.name || ""}, ${address.address || ""}`
        : t("no_delivery_address") || "Pickup — no delivery address"}
    </p>
  </div>
);

// CancelButton component with status check
const CancelButton = ({ t, onClick, status }) => {
  // Statuses where cancellation is NOT allowed
  const nonCancelableStatuses = ['shipping', 'delivered', 'cancelled', 'completed', 'approved'];
  const isCancelable = !nonCancelableStatuses.includes(status?.toLowerCase());
  
  // Don't render button if order can't be cancelled
  if (!isCancelable) return null;
  
  return (
    <h1
      className="font-bold text-md text-[#000000] mt-4 border-b w-fit cursor-pointer"
      onClick={onClick}
    >
      {t("Cancel_Order")}
    </h1>
  );
};

// Message for non-cancelable orders
const NonCancelableMessage = ({ t, status, statusMessage }) => {
  // If there's a status message from API, use it
  if (statusMessage) {
    return (
      <p className="text-amber-600 text-md mt-4">
        {statusMessage}
      </p>
    );
  }
  
  const statusMessages = {
    'shipping': t("order_shipped"),
    'delivered': t("order_delivered"),
    'completed': t("order_completed"),
    'cancelled': t("order_cancelled"),
    'approved': t("order_approved")
  };
  
  const message = statusMessages[status?.toLowerCase()] || 
                  "This order cannot be cancelled due to its current status.";
  
  return (
    <p className="text-red-600 text-md mt-4 italic">
      {message}
    </p>
  );
};

// Status badge component
const StatusBadge = ({ status }) => {
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'shipping': 'bg-blue-100 text-blue-800',
    'delivered': 'bg-purple-100 text-purple-800',
    'completed': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  
  const colorClass = statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
      {status}
    </span>
  );
};

// Main component
const OrderDetailsClient = ({ orderId }) => {
  const t = useTranslations("order");
  const locale = useLocale();
  const [showCancelPage, setShowCancelPage] = useState(false);
  const { data: response, isLoading, error } = useOrder(orderId);

  // Extract the actual order data from response
  const orderData = response?.result || response;

  // Loading state
  if (isLoading) {
    return <Loader text={t("Loading_order_details")} />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error.message} />;
  }

  // Show cancel page
  if (showCancelPage) {
    return (
      <OrderCancell
        orderId={orderId}
        orderData={orderData}
        onBack={() => setShowCancelPage(false)}
      />
    );
  }

  // Map API data from new structure
  const mappedOrderData = {
    orderNo: orderData.order_code,
    orderDate: new Date(orderData.created_at).toLocaleDateString(),
    subtotal: orderData.pricing?.subtotal?.formatted,
    shipping: orderData.pricing?.shipping?.formatted,
    discount: orderData.pricing?.discount?.formatted,
    total: orderData.pricing?.total?.formatted,
    itemsCount: orderData.items_count,
    status: orderData.status,
    deliveryStatus: orderData.delivery_status,
    statusMessage: orderData.status_message,
    items: orderData.items || [],
    shippingAddress: orderData.address,
    paymentMethod: orderData.payment_method,
    deliveryMethod: orderData.delivery_method,
    userEmail: orderData.user_email
  };

  // Check if order can be cancelled
  const nonCancelableStatuses = ['shipping', 'delivered', 'cancelled', 'completed', 'approved'];
  const canCancel = !nonCancelableStatuses.includes(mappedOrderData.status?.toLowerCase());

  return (
    <div className="container5 mx-auto lg:mt-0 mt-[7rem]">
      <InfoRow label={t("order_no")} value={mappedOrderData.orderNo} />
      <InfoRow label={t("order_date")} value={mappedOrderData.orderDate} />
      
      {/* Status Badge */}
      <div className="mt-4">
        <StatusBadge status={mappedOrderData.status} />
        {mappedOrderData.deliveryStatus && mappedOrderData.deliveryStatus !== mappedOrderData.status && (
          <span className="ml-2 text-sm text-gray-500">
            {t('delivery')}: {mappedOrderData.deliveryStatus}
          </span>
        )}
      </div>

      {/* Status Message */}
      {mappedOrderData.statusMessage && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700 text-sm">
            {mappedOrderData.statusMessage}
          </p>
        </div>
      )}

      {/* Pricing Summary */}
      <div className="mt-4 space-y-2">
        <div className="flex gap-x-2">
          <h1 className="text-[#000000] font-bold text-md">{t("subtotal")}:</h1>
          <p className="text-[#000000]">{mappedOrderData.subtotal}</p>
        </div>
        <div className="flex gap-x-2">
          <h1 className="text-[#000000] font-bold text-md">{t("shipping")}:</h1>
          <p className="text-[#000000]">{mappedOrderData.shipping}</p>
        </div>
        {mappedOrderData.discount !== "0 SYP" && mappedOrderData.discount !== "0" && (
          <div className="flex gap-x-2">
            <h1 className="text-[#000000] font-bold text-md">{t("Discount")}:</h1>
            <p className="text-[#000000] text-green-600">-{mappedOrderData.discount}</p>
          </div>
        )}
        <div className="flex gap-x-2 border-t pt-2">
          <h1 className="text-[#000000] font-bold text-md">{t("Total")}:</h1>
          <p className="text-[#000000] font-bold">{mappedOrderData.total}</p>
        </div>
      </div>

      <div className="w-full h-auto p-4 bg-white border border-[#959595] mt-3">
        <h1 className="text-[#000000] font-bold text-md">
          {t("Products_You_Purchased")}:
        </h1>

        <p className="text-sm mt-3 text-[#000000]">
          {mappedOrderData.itemsCount}{" "}
          {mappedOrderData.itemsCount === 1 ? t("piece") : t("pieces")}
        </p>

        <div className="w-full h-[0.1rem] border border-[#D4D4D4] bg-[#D4D4D4] mt-3" />

        <OrderProgress locale = {locale} t={t} status={mappedOrderData.status} />

        {/* Products List */}
        <div className="mt-6 space-y-4">
          {mappedOrderData.items.map((item, index) => (
            <ProductItem t={t} key={index} item={item} />
          ))}
        </div>

        {/* Conditional rendering based on order status */}
        {canCancel ? (
          <CancelButton 
            t={t}
            onClick={() => setShowCancelPage(true)} 
            status={mappedOrderData.status}
          />
        ) : (
          <NonCancelableMessage 
            t={t} 
            status={mappedOrderData.status}
            statusMessage={mappedOrderData.statusMessage}
          />
        )}
        
        <DeliveryAddress t={t} address={mappedOrderData.shippingAddress} />
      </div>
    </div>
  );
};

export default OrderDetailsClient;