import { CheckoutView } from "@/components/payment/checkout-view";

export const metadata = { title: "Checkout" };

export default async function PayPage({ params }: PageProps<"/bookings/[id]/pay">) {
  const { id } = await params;
  return <CheckoutView bookingId={id} />;
}
