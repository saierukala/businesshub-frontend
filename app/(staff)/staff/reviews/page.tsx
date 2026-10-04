import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ReviewsList } from "@/components/reviews/reviews-list";

export const metadata = { title: "Reviews" };

export default function ReviewsPage() {
  return (
    <>
      <PageHeader title="Reviews" description="What customers said about completed repairs." />
      <Suspense>
        <ReviewsList />
      </Suspense>
    </>
  );
}
