import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TechnicianDetail } from "@/components/technicians/technician-detail";

export const metadata = { title: "Technician" };

export default async function TechnicianPage({ params }: PageProps<"/staff/technicians/[id]">) {
  const { id } = await params;
  return (
    <>
      <Link href="/staff/technicians" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Technicians
      </Link>
      <TechnicianDetail id={id} />
    </>
  );
}
