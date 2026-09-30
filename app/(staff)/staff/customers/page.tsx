import { PageHeader } from "@/components/layout/page-header";
import { CustomersList } from "@/components/customers/customers-list";

export const metadata = { title: "Customers" };

export default function CustomersPage() {
  return (
    <>
      <PageHeader title="Customers" description="Find a customer before booking for them, or add a new one." />
      <CustomersList />
    </>
  );
}
