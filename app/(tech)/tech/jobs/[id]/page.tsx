import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TechJob } from "@/components/tech/tech-job";

export const metadata = { title: "Job" };

export default async function TechJobPage({ params }: PageProps<"/tech/jobs/[id]">) {
  const { id } = await params;
  return (
    <>
      <Link href="/tech" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> My jobs
      </Link>
      <TechJob id={id} />
    </>
  );
}
