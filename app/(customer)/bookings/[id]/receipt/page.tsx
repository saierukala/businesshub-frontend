import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ReceiptView } from "@/components/payment/receipt-view";

export const metadata = { title: "Receipt" };

export default async function ReceiptPage({ params }: PageProps<"/bookings/[id]/receipt">) {
  const { id } = await params;
  return (
    <>
      <Link href={`/bookings/${id}`} className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground print:hidden">
        <ChevronLeft className="size-4" /> Booking
      </Link>
      <ReceiptView bookingId={id} />
    </>
  );
}
