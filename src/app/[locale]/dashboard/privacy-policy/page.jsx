import PrivacyPolicyClient from "@/components/privacyPolicy/privacyPolicyClient";
import { apiGet } from "@/lib/api";

// Force dynamic rendering - don't pre-render at build time
export const dynamic = "force-dynamic";

async function PrivacyPolicy() {
  return <PrivacyPolicyClient />;
}

export default PrivacyPolicy;
