import { PageHeader } from "@/components/layout/page-header";
import { AddressSection } from "@/components/records/address-section";
import { ApplianceSection } from "@/components/records/appliance-section";

export const metadata = { title: "My account" };

// Customer's own addresses and appliances (no customerId: the backend uses the session).
export default function AccountPage() {
  return (
    <>
      <PageHeader title="My account" description="Where we visit and what we repair." />
      <AddressSection />
      <ApplianceSection />
    </>
  );
}
