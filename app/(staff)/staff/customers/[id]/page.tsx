import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CustomerProfile } from "@/components/customers/customer-profile";
import { AddressSection } from "@/components/records/address-section";
import { ApplianceSection } from "@/components/records/appliance-section";

export const metadata = { title: "Customer" };

export default async function CustomerPage({ params }: PageProps<"/staff/customers/[id]">) {
  const { id } = await params;
  return (
    <>
      <Link href="/staff/customers" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Customers
      </Link>
      <CustomerProfile id={id} />
      <AddressSection customerId={id} />
      <ApplianceSection customerId={id} />
    </>
  );
}
