import { PageHeader } from "@/components/layout/page-header";
import { CustomerHome } from "@/components/dashboard/customer-home";

export const metadata = { title: "Home" };

export default function CustomerHomePage() {
  return (
    <>
      <PageHeader title="Home" description="Your next visit, your appliances and recent activity." />
      <CustomerHome />
    </>
  );
}
