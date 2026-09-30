import { PageHeader } from "@/components/layout/page-header";
import { StaffBookingFlow } from "@/components/booking/staff-booking-flow";

export const metadata = { title: "New booking" };

export default function NewStaffBookingPage() {
  return (
    <>
      <PageHeader title="New booking" description="Book a repair for a customer who called, messaged or walked in." />
      <StaffBookingFlow />
    </>
  );
}
