import ImprintClient from "@/components/Imprint/component/ImprintClient";
// Force dynamic rendering - don't pre-render at build time
export const dynamic = "force-dynamic";

async function Imprint() {
  return <ImprintClient />;
}

export default Imprint;
