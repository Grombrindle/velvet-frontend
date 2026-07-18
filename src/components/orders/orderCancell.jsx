"use client";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { CancellSuccess } from "./cancellSuccess";
import { useRejectionReasons, useCancelOrder } from "./hooks/useGetOrders";
import { useTranslations } from "next-intl";

const OrderCancell = ({ orderData, orderId }) => {
  const t = useTranslations("order");
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedReasonId, setSelectedReasonId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  // Fetch rejection reasons from API
  const {
    data: rejectionReasons,
    isLoading: reasonsLoading,
    error: reasonsError,
  } = useRejectionReasons();

  // Cancel order mutation
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  // Show success component if cancellation is confirmed
  if (showSuccess) {
    return <CancellSuccess t={t} onBack={() => setShowSuccess(false)} />;
  }

  // Get all products from order items
  const products = orderData?.items || orderData?.products || [];

  const handleCancelOrder = () => {
    if (!selectedReasonId) {
      toast.error(t("Please select a return reason"), {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    cancelOrder(
      {
        orderId: orderId,
        reasonId: selectedReasonId,
        reason: selectedReason,
      },
      {
        onSuccess: () => {
          toast.success(t("Order cancelled successfully!"), {
            duration: 2000,
            position: "top-center",
          });

          // Delay showing success component to allow toast to be seen
          setTimeout(() => {
            setShowSuccess(true);
          }, 2000);
        },
        onError: (error) => {
          toast.error(error.message || t("failed_cancell"), {
            duration: 4000,
            position: "top-center",
          });
        },
      },
    );
  };

  return (
    <>
      <div className="w-full h-auto border border-[#959595] px-4 py-5 lg:mt-0 mt-[7rem]">
        <div className="flex gap-x-2">
          <h1 className="font-bold text-[#000000] text-md">{t("order_no")}:</h1>
          <p className="text-[#000000] text-md">{orderData?.order_code}</p>
        </div>

        <p className="text-md text-[#000000] mt-2">
          <span className="font-bold">{orderData?.invoice_number}</span>{" "}
          {t("cancel_messgae")}
        </p>

        <div className="w-full h-[0.1rem] mt-4 border border-[#D4D4D4]"></div>

        {/* Show ALL Products */}
        <div className="mt-4 space-y-6">
          {products.map((product, index) => (
            <div key={index} className="flex gap-x-4">
              <div className="relative w-24 h-36">
                <Image
                  src={
                    product?.image ||
                    orderData?.images?.[0] ||
                    "/images/cloth2.jpg"
                  }
                  alt={product?.product_name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="font-bold text-md text-[#000000]">
                  {product?.product_name}
                </h1>
                <h1 className="font-bold text-md text-[#333333] mt-2">
                  {t("Color")}:{" "}
                  <span className="font-[400]">{product?.color || "N/A"}</span>
                </h1>
                <h1 className="font-bold text-md text-[#333333] mt-2">
                  {t("Size")}:{" "}
                  <span className="font-[400]">{product?.size || "N/A"}</span>
                </h1>
                {product?.quantity && (
                  <h1 className="font-bold text-md text-[#333333] mt-2">
                    {t("Quantity")}:{" "}
                    <span className="font-[400]">{product.quantity}</span>
                  </h1>
                )}
                {product?.total?.formatted && (
                  <h1 className="font-bold text-md text-[#333333] mt-2">
                    {t("price")}:{" "}
                    <span className="font-[400]">
                      {product.total.formatted}
                    </span>
                  </h1>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Select dropdown for return reason */}
        <div className="mt-5">
          {reasonsLoading ? (
            <div className="w-full p-3 border border-[#333333] rounded-md bg-gray-50 text-[#666666]">
              {t("Loading_reasons")}
            </div>
          ) : reasonsError ? (
            <div className="w-full p-3 border border-red-300 rounded-md bg-red-50 text-red-600">
              {t("Error_loading_reasons")}
            </div>
          ) : (
            <select
              value={selectedReasonId}
              onChange={(e) => {
                const reasonId = parseInt(e.target.value);
                const selectedReasonObj = rejectionReasons?.find(
                  (reason) => reason.id === reasonId,
                );
                setSelectedReasonId(reasonId);
                setSelectedReason(selectedReasonObj?.title || "");
              }}
              className="w-full p-3 border border-[#333333] rounded-md bg-white text-[#000000] focus:outline-none"
            >
              <option value="">{t("Select a cancell reason")}</option>
              {rejectionReasons?.map((reason) => (
                <option key={reason.id} value={reason.id}>
                  {reason.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Submit button */}
        <button
          onClick={handleCancelOrder}
          disabled={isCancelling}
          className="w-full cursor-pointer bg-[#000000] h-[3.8rem] text-white font-bold mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
        >
          {isCancelling ? t("CANCELLING") : t("CANCEL_CONFIRMATION")}
        </button>
      </div>
    </>
  );
};

export default OrderCancell;
