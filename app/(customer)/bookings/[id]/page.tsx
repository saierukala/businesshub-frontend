import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { BookingDetail } from "@/components/booking/booking-detail";

export const metadata = { title: "Booking" };

export default async function BookingPage({ params }: PageProps<"/bookings/[id]">) {
  const { id } = await params;
  return (
    <>
      <Link href="/bookings" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> My bookings
      </Link>
      <BookingDetail id={id} />
    </>
  );
}
