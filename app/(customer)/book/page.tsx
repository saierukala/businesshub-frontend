import { PageHeader } from "@/components/layout/page-header";
import { BookingWizard } from "@/components/booking/booking-wizard";

export const metadata = { title: "Book a repair" };

export default function BookPage() {
  return (
    <>
      <PageHeader title="Book a repair" description="Choose your appliance, describe the problem and pick a time." />
      <BookingWizard />
    </>
  );
}
