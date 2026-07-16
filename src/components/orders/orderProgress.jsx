export const OrderProgress = ({ t, status, locale }) => {
  const steps = [
    t("order_received"),
    t("Preparing"),
    t("Shipped"),
    t("Delivered"),
  ];
  const totalDots = 5;

  // Map API status → step index
  const statusMap = {
    pending: 1,
    paid: 1,
    received: 1,
    preparing: 2,
    shipping: 3,
    shipped: 3,
    delivered: 4,
    cancelled: -1,
    refunded: -1,
    payment_failed: -1,
  };

  const currentStep = statusMap[status?.toLowerCase()] ?? 0;

  // Check if order is cancelled, refunded, or payment failed
  const isTerminalState = ["cancelled", "refunded", "payment_failed"].includes(
    status?.toLowerCase(),
  );

  // Check if status is paid
  const isPaid = status?.toLowerCase() === "paid";

  return (
    <div className="w-full mt-6">
      {/* Labels / التسميات */}
      <div className="relative flex justify-between text-sm text-gray-600 mb-2">
        {steps.map((step, index) => {
          // Step number (1-indexed for display)
          const stepNumber = index + 1;
          // Check if this step has been reached
          const isReached = !isTerminalState && stepNumber <= currentStep;

          // Special text for paid status on step 1
          let displayText = step;
          if (isPaid && stepNumber === 1) {
            displayText = "Payment Confirmed";
          }

          return (
            <div
              key={index}
              className="text-center"
              style={{ width: `${100 / steps.length}%` }}
            >
              <p
                className={`text-xs ${isReached ? "font-bold text-black" : ""}`}
              >
                {stepNumber}.
              </p>
              <p className={`mb-2 ${isReached ? "font-bold text-black" : ""}`}>
                {displayText}
              </p>
            </div>
          );
        })}
      </div>

      {/* Progress Bar / شريط التقدم */}
      <div className="relative w-full">
        {/* Single border - using background color instead of border */}
        <div className="w-full h-[0.1rem]  border border-[#D4D4D4] border-dashed rounded-full" />

        {/* Active Progress - no border */}
        {!isTerminalState && (
          <div
            className="absolute top-0 h-1 bg-black rounded-full transition-all"
            style={{ width: `${(currentStep / (totalDots - 1)) * 100}%` }}
          />
        )}

        {/* Dots / النقاط */}
        <div className="absolute top-1/2 left-0 w-full transform -translate-y-1/2">
          {[...Array(totalDots)].map((_, index) => {
            let dotColor = "#C4C4C4";
            let borderColor = "#C4C4C4";

            if (isTerminalState) {
              // For terminal states, show all dots as red
              dotColor = "#EF4444";
              borderColor = "#EF4444";
            } else if (isPaid && index === 0) {
              // Special green color for paid status on first dot
              dotColor = "#10B981";
              borderColor = "#10B981";
            } else if (index <= currentStep) {
              dotColor = "black";
              borderColor = "black";
            }

            return (
              <div
                key={index}
                className={`absolute w-5 h-5 rounded-full border-2 transform ${locale === "en" ? "-translate-x-1/2" : "ranslate-x-1/2"} -translate-y-1/2`}
                style={{
                  [locale === "ar" ? "right" : "left"]:
                    `${(index / (totalDots - 1)) * 100}%`,
                  backgroundColor: dotColor,
                  borderColor: borderColor,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Status Message for Terminal States / رسالة الحالات النهائية */}
      {isTerminalState && (
        <div className="mt-4 text-center">
          <p className="text-sm text-red-600 font-medium">
            {status?.toLowerCase() === "cancelled" && t("Order Cancelled")}
            {status?.toLowerCase() === "refunded" && t("order_refunded")}
            {status?.toLowerCase() === "Payment Failed" && t("payment_failed")}
          </p>
        </div>
      )}

      {/* Special Message for Paid Status / رسالة خاصة لحالة الدفع */}
      {isPaid && !isTerminalState && (
        <div className="mt-4 text-center">
          <p className="text-sm text-green-600 font-medium">
            ✓ {t("payment_confirmed_successfully")}
          </p>
        </div>
      )}
    </div>
  );
};
