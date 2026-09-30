import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Shown when someone opens /reset-password, /accept-invite or /verify-email without ?token=.
export function MissingToken({ hint }: { hint: React.ReactNode }) {
  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertTitle>This link is incomplete</AlertTitle>
      <AlertDescription>
        Open the link from your email again, or {hint}.{" "}
        <Link href="/login" className="underline underline-offset-4">
          Go to log in
        </Link>
      </AlertDescription>
    </Alert>
  );
}

// Reads ?token= from Next's searchParams (can be a string, an array, or missing).
export function tokenFrom(params: Record<string, string | string[] | undefined>): string | null {
  const t = params.token;
  return typeof t === "string" && t.length > 0 ? t : null;
}
