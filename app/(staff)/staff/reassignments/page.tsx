import { PageHeader } from "@/components/layout/page-header";
import { BookingsList } from "@/components/booking/bookings-list";

export const metadata = { title: "Needs reassignment" };

export default function ReassignmentsPage() {
  return (
    <>
      <PageHeader
        title="Needs reassignment"
        description="These bookings lost their technician (for example to sick leave). Open one to give it to another free technician, or reschedule it with the customer."
      />
      <BookingsList staff queue />
    </>
  );
}
