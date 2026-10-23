import { FeedbackPage } from "@/components/feedback/FeedbackPage";
import { fetchFeedback, fetchFeedbackPhotos } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [feedback, photos] = await Promise.all([fetchFeedback(), fetchFeedbackPhotos()]);
  return <FeedbackPage feedback={feedback} photos={photos} />;
}
