"use client";

import { useTranslations } from "next-intl";
import ErrorState from "../ui/errorMessage";
import Loader from "../ui/loader";
import { usePrivacyPolicy } from "./hook/privacyPolicy";

function PrivacyPolicyClient() {
  const { data: privacyPolicyData, isLoading, error } = usePrivacyPolicy();
  const t = useTranslations("privacyPolicy");
  if (isLoading) {
    return <Loader text={t("loading_privacy_policy")} />;
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
          {privacyPolicyData?.length > 0 ? (
            privacyPolicyData.map((privacyPolicy, index) => (
              <p
                key={index}
                className="font-[400] text-[#000000] text-[1.1rem]"
              >
                {privacyPolicy?.clause}
              </p>
            ))
          ) : (
            <p className="font-[400] text-[#000000] text-[1.1rem]">
              No privacy policy available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyClient;
