"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getLocalePrefix } from "@/lib/locale";

function CallbackInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    const status = searchParams.get("status");
    const localePrefix = getLocalePrefix(pathname);

    if (status === "payment_success" && orderId) {
      router.replace(`${localePrefix}/checkout/confirmation/${orderId}`);
    } else {
      router.replace(`${localePrefix}/cart`);
    }
  }, [router, searchParams, pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-600">Processing payment...</p>
      </div>
    </div>
  );
}

function PaymentCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}

export default PaymentCallback;
