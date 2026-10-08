import { FeedbackPage } from "@/components/feedback/FeedbackPage";
import { fetchFeedback } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const feedback = await fetchFeedback();
  return <FeedbackPage feedback={feedback} />;
}
