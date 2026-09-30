import { PageHeader } from "@/components/layout/page-header";
import { TechniciansList } from "@/components/technicians/technicians-list";

export const metadata = { title: "Technicians" };

export default function TechniciansPage() {
  return (
    <>
      <PageHeader title="Technicians" description="Skills, service areas, working hours and time off. Bookings can only go to technicians set up here." />
      <TechniciansList />
    </>
  );
}
