import { PageHeader } from "@/components/layout/page-header";
import { ServicesList } from "@/components/services/services-list";
import { ApplianceTypes } from "@/components/services/appliance-types";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Services" };

export default async function ServicesPage() {
  await requireUser(["OWNER"], "/staff/services"); // managers are sent back to /staff
  return (
    <>
      <PageHeader title="Services" description="What customers can book, how long it takes, the visit charge, and the appliance types you repair." />
      <ServicesList />
      <ApplianceTypes />
    </>
  );
}
