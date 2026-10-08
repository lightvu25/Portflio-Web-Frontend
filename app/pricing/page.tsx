import { PricingPage } from "@/components/pricing/PricingPage";
import { fetchPricing, fetchSite } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [packages, site] = await Promise.all([fetchPricing(), fetchSite()]);
  return <PricingPage packages={packages} deposit={site?.depositAmount ?? 500000} />;
}
