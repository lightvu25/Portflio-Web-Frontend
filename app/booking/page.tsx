import { BookingPage } from "@/components/booking/BookingPage";
import { fetchPricing } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const packages = await fetchPricing();
  return <BookingPage packages={packages} />;
}
