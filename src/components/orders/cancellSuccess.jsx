"use client";
import { useRouter } from "next/navigation";
import { getLocalePrefix } from "@/lib/locale"; // Import this helper function

export const CancellSuccess = ({t}) => {
  const router = useRouter();
  
  const handleContinue = () => {
    const localePrefix = getLocalePrefix(window.location.pathname);
    router.push(`${localePrefix}/dashboard/orders`);
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="font-bold text-2xl text-[#000000]">
         {t("YOUR_CANCELLATION_REQUEST")}
        </h1>
        {/* <p className="text-[#333333] text-xl">
          The result of your request will be sent to you via email.
        </p> */}
        <button 
          onClick={handleContinue}
          className="w-full h-[3.5rem] bg-[#000000] text-white mb-[10rem] cursor-pointer"
        >
          {t("CONTINUE")}
        </button>
      </div>
    </div>
  );
};