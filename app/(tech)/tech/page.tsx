import { TechJobs } from "@/components/tech/tech-jobs";
import { formatWeekdayDate, greeting } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "My jobs" };

// The layout has already checked the role; the user is only needed for the greeting. Date and greeting use IST.
export default async function TechPage() {
  const user = await getCurrentUser();
  const firstName = user?.name.split(/\s+/)[0] ?? "there";
  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{formatWeekdayDate(new Date().toISOString())}</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting()}, {firstName}
        </h1>
        <p className="text-muted-foreground">Your jobs for today and what is coming up.</p>
      </div>
      <TechJobs />
    </>
  );
}
