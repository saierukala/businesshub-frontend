import { PageHeader } from "@/components/layout/page-header";
import { BookingsList } from "@/components/booking/bookings-list";

export const metadata = { title: "Bookings" };

export default function StaffBookingsPage() {
  return (
    <>
      <PageHeader title="Bookings" description="Every booking, from customers and from the phone, WhatsApp and walk-ins." />
      <BookingsList staff />
    </>
  );
}
