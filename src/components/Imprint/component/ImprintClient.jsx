"use client";

import { useTranslations } from "next-intl";
import { useImprint } from "../hook/useImprint";
import ErrorState from "@/components/ui/errorMessage";
import Loader from "@/components/ui/loader";

function ImprintClient() {
  const { data: ImprintData, isLoading, error } = useImprint();
  const t = useTranslations("imprint");

  if (isLoading) {
    return <Loader text={t("loading_imprint")} />;
  }

  // Show error state
  if (error) {
    return <ErrorState message={error.message} />;
  }

  return (
    <div className="container3 mx-auto lg:mt-0 mt-[7rem]">
      <div
        style={{ boxShadow: "0px 0px 4px 0px #00000040" }}
        className="w-full h-auto bg-white p-[1.5rem]"
      >
        <div className="space-y-[1.5rem]">
          {ImprintData?.length > 0 ? (
            ImprintData.map((imprint, index) => (
              <p
                key={imprint?.id ?? index}
                className="font-[400] text-[#000000] text-[1.1rem] whitespace-pre-line"
              >
                {imprint?.clause}
              </p>
            ))
          ) : (
            <p className="font-[400] text-[#000000] text-[1.1rem]">
              {t("no_imprint_available")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImprintClient;