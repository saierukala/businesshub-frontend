import { PageHeader } from "@/components/layout/page-header";
import { BookingsList } from "@/components/booking/bookings-list";

export const metadata = { title: "My bookings" };

export default function BookingsPage() {
  return (
    <>
      <PageHeader title="My bookings" description="Your repair visits, past and upcoming." />
      <BookingsList />
    </>
  );
}
