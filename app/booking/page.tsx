import { redirect } from "next/navigation";

export default async function BookingRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const params = await searchParams;
  const pkg = params?.package;
  if (pkg) {
    redirect(`/pricing?package=${encodeURIComponent(pkg)}#booking`);
  }
  redirect("/pricing#booking");
}
