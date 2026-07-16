import { apiGet } from "@/lib/api";

async function PrivacyPolicy() {
  const privacyPolicyData = await apiGet(`/privacy-policy`, {
    next: { revalidate: 300 }
  });
  
  return (
    <div className="container3 mx-auto lg:mt-0 mt-[7rem]">
      <div style={{boxShadow:'0px 0px 4px 0px #00000040'}} className="w-full h-auto bg-white p-[1.5rem]">
        <div className="space-y-[1.5rem]">
          {privacyPolicyData?.result?.map((privacyPolicy, index) => (
            <p key={index} className="font-[400] text-[#000000] text-[1.1rem]">
              {privacyPolicy?.clause}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;