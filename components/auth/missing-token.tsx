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
// Tokens only use A-Z a-z 0-9 - _ (base64url). A link copied from a terminal or a wrapped email can pick up
// line breaks inside it or text after it (e.g. "\n\nIn"), so drop whitespace and keep only the token part.
// The server still checks the token exactly; this only forgives copy mistakes.
export function tokenFrom(params: Record<string, string | string[] | undefined>): string | null {
  const t = params.token;
  if (typeof t !== "string") return null;
  return t.replace(/\s+/g, "").match(/^[A-Za-z0-9_-]+/)?.[0] ?? null;
}
