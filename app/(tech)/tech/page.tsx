import { PageHeader } from "@/components/layout/page-header";
import { TechJobs } from "@/components/tech/tech-jobs";

export const metadata = { title: "My jobs" };

export default function TechPage() {
  return (
    <>
      <PageHeader title="My jobs" description="Today's visits and what is coming up." />
      <TechJobs />
    </>
  );
}
