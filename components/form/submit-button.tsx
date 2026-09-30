import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// Disabled while the request runs, so a double click can't submit twice.
export function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending} aria-busy={pending}>
      {pending && <Spinner />}
      {children}
    </Button>
  );
}
