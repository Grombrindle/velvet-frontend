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

// Reusable Product Item component (Handles both Standard & Bundled sub-items)
const ProductItem = ({ item, t, isSubItem = false }) => (
  <div className={`flex gap-x-4 pb-4`}>
    {/* Image - Same size for all items */}
    <div className="relative w-[6rem] h-[9rem] flex-shrink-0">
      {item.image ? (
        <Image
          src={item.image}
          alt={item.product_name}
          fill
          className="object-cover rounded"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs rounded">
          No image
        </div>
      )}
    </div>

    {/* Info */}
    <div className="flex flex-col justify-between flex-1">
      <div>
        <h1 className={`font-bold text-[#000000] ${isSubItem ? "text-md" : "text-lg"}`}>
          {item.product_name}
        </h1>
        {isSubItem && <span className="text-xs text-gray-500 font-medium">{t("Bundle Item")}</span>}
      </div>

      <div className="space-y-0.5">
        <ProductAttribute label={t("Color")} value={item.color} />
        <ProductAttribute label={t("Size")} value={item.size} />
        <ProductAttribute label={t("Quantity")} value={item.quantity} />
      </div>

      <p className="font-bold text-md text-[#333]">
        {item.total?.formatted || `${item.unit_price?.amount} ${item.unit_price?.currency_code}`}
      </p>
    </div>
  </div>
);

// Reusable Address component
const DeliveryAddress = ({ address, t }) => {
  if (!address) return null;

  return (
    <div className="w-full h-auto border border-[#D4D4D4] rounded-md mt-5 p-4">
      <h1 className="font-bold text-md text-[#000000]">{t("ORDER_DETAILS")}</h1>
      
      <h1 className="font-bold text-md text-[#000000] mt-4">
        {t("delivery_address")}
      </h1>
      <p className="text-[#000000] text-md mt-2">
        {address.name} {address.sur_name}, {address.country?.name}, {address.city?.name}, {address.address}
      </p>
    </div>
  );
};

// Retry Payment Button component
const RetryPaymentButton = ({ t, onClick, url }) => {
  if (!url) return null;
  
  return (
    <button
      onClick={() => window.open(url, '_blank')}
      className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors"
    >
      {t("Retry_Payment")}
    </button>
  );
};

// CancelButton component with status check
const CancelButton = ({ t, onClick, status }) => {
  // Statuses where cancellation is NOT allowed
  const nonCancelableStatuses = [
    'shipping', 
    'delivered', 
    'cancelled', 
    'completed', 
    'approved', 
    'paid',
    'payment_failed',
    'refunded' // Refunded orders cannot be cancelled
  ];
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
const NonCancelableMessage = ({ t, status, statusMessage, needsPaymentAction, retryPaymentUrl }) => {
  // If there's a status message from API, use it
  if (statusMessage) {
    return (
      <div className="mt-4">
        <p className="text-amber-600 text-md">
          {statusMessage}
        </p>
        {/* Show retry payment button if payment failed and needs action */}
        {status?.toLowerCase() === 'payment_failed' && needsPaymentAction && retryPaymentUrl && (
          <RetryPaymentButton t={t} onClick={() => {}} url={retryPaymentUrl} />
        )}
      </div>
    );
  }
  
  const statusMessages = {
    'paid': t("order_paid") || "This order has been paid and cannot be cancelled.",
    'payment_failed': t("order_payment_failed") || "Payment failed. Please try again.",
    'shipping': t("order_shipped"),
    'delivered': t("order_delivered"),
    'completed': t("order_completed"),
    'cancelled': t("order_cancelled"),
    'approved': t("order_approved"),
    'refunded': t("order_refunded") || "This order has been refunded."
  };
  
  const message = statusMessages[status?.toLowerCase()] || 
                  "This order cannot be cancelled due to its current status.";
  
  // Special handling for payment_failed
  if (status?.toLowerCase() === 'payment_failed') {
    return (
      <div className="mt-4">
        <p className="text-red-600 text-md">
          {message}
        </p>
        {needsPaymentAction && retryPaymentUrl && (
          <div className="mt-2">
            <RetryPaymentButton t={t} onClick={() => {}} url={retryPaymentUrl} />
          </div>
        )}
      </div>
    );
  }
  
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
    'paid': 'bg-green-100 text-green-800',
    'payment_failed': 'bg-red-100 text-red-800',
    'approved': 'bg-green-100 text-green-800',
    'shipping': 'bg-blue-100 text-blue-800',
    'delivered': 'bg-purple-100 text-purple-800',
    'completed': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-800',
    'refunded': 'bg-red-100 text-red-800'
  };
  
  const colorClass = statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
      {status?.replace('_', ' ').toUpperCase()}
    </span>
  );
};

// Main component
const OrderDetailsClient = ({ orderId }) => {
  const t = useTranslations("order");
  const locale = useLocale();
  const [showCancelPage, setShowCancelPage] = useState(false);
  const { data: response, isLoading, error } = useOrder(orderId);

  // Extract nested 'order' from 'result' based on new API structure
  const orderData = response?.result?.order || response?.order || response?.result || response;
  const nextStep = response?.result?.next_step || null;

  // Loading state
  if (isLoading) {
    return <Loader text={t("Loading_order_details")} />;
  }

  // Error state or missing order
  if (error || !orderData) {
    return <ErrorState message={error?.message || "Order data not found"} />;
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

  // Map API data from the correct JSON path structure
  const mappedOrderData = {
    orderNo: orderData.order_code,
    orderDate: orderData.created_at ? new Date(orderData.created_at).toLocaleDateString() : "",
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
    paymentMethod: orderData.payment_method?.name,
    deliveryMethod: orderData.delivery_method?.name,
    userEmail: orderData.user_email,
    needsPaymentAction: orderData.needs_payment_action || false
  };

  // Check if order can be cancelled
  const nonCancelableStatuses = [
    'shipping', 
    'delivered', 
    'cancelled', 
    'completed', 
    'approved', 
    'paid',
    'payment_failed',
    'refunded'
  ];
  const canCancel = !nonCancelableStatuses.includes(mappedOrderData.status?.toLowerCase());

  // Get retry payment URL from nextStep
  const retryPaymentUrl = nextStep?.type === 'webview' ? nextStep.url : null;

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
        {mappedOrderData.discount && parseFloat(mappedOrderData.discount.replace(/[^0-9.]/g, '')) > 0 && (
          <div className="flex gap-x-2">
            <h1 className="text-[#000000] font-bold text-md">{t("Discount")}:</h1>
            <p className="text-green-600">-{mappedOrderData.discount}</p>
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

        <OrderProgress locale={locale} t={t} status={mappedOrderData.status} />

        {/* Products List (With Bundle Child Items Render Support) */}
        <div className="mt-6 space-y-4">
          {mappedOrderData.items.map((item, index) => (
            <div key={item.id || index} className="border-b pb-4 last:border-0">
              <ProductItem t={t} item={item} />
              
              {/* Nested Bundle Items display */}
              {item.bundles && item.bundles.length > 0 && (
                <div className="mt-2 space-y-2">
                  {item.bundles.map((bundleSubItem, subIdx) => (
                    <ProductItem 
                      key={bundleSubItem.id || subIdx} 
                      t={t} 
                      item={bundleSubItem} 
                      isSubItem={true} 
                    />
                  ))}
                </div>
              )}
            </div>
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
            needsPaymentAction={mappedOrderData.needsPaymentAction}
            retryPaymentUrl={retryPaymentUrl}
          />
        )}
        
        {/* Show Retry Payment button for payment_failed status */}
        {mappedOrderData.status?.toLowerCase() === 'payment_failed' && 
         mappedOrderData.needsPaymentAction && 
         retryPaymentUrl && (
          <div className="mt-2">
            <RetryPaymentButton 
              t={t} 
              onClick={() => {}} 
              url={retryPaymentUrl} 
            />
          </div>
        )}
        
        <DeliveryAddress t={t} address={mappedOrderData.shippingAddress} />
      </div>
    </div>
  );
};

export default OrderDetailsClient;