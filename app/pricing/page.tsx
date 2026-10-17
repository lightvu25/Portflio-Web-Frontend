import { PricingPage } from "@/components/pricing/PricingPage";
import { fetchPhotos, fetchPricing, fetchSite } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [packages, site, photos] = await Promise.all([fetchPricing(), fetchSite(), fetchPhotos()]);
  return <PricingPage packages={packages} deposit={site?.depositAmount ?? 500000} photos={photos.data} />;
}
