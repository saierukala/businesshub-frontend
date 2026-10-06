import { PageHeader } from "@/components/layout/page-header";
import { AddressSection } from "@/components/records/address-section";
import { ApplianceSection } from "@/components/records/appliance-section";
import { ProfileCard } from "@/components/records/profile-card";
import { requireUser } from "@/lib/session";

export const metadata = { title: "My account" };

// Customer's own addresses and appliances (no customerId: the backend uses the session).
export default async function AccountPage() {
  const user = await requireUser(["CUSTOMER"], "/account");
  return (
    <>
      <PageHeader title="My account" description="Your details, where we visit and what we repair." />
      <ProfileCard user={user} />
      <AddressSection />
      <ApplianceSection />
    </>
  );
}
