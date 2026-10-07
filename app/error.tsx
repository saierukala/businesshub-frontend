"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CloudOff, TriangleAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

// Last safety net: if a page crashes while rendering, show this instead of a blank screen.
// (A failed API call is handled inside each screen with its own "Try again"; this is for real bugs,
// and for the server-side login check when the API is down, see lib/session.ts.)
// In production Next.js hides the error's message, so we ask the API ourselves whether it is up.
// In this Next.js version the recovery function is called `retry`.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const [serverDown, setServerDown] = useState(false);

  useEffect(() => {
    console.error(error);
    fetch("/api/health", { cache: "no-store" })
      .then((res) => setServerDown(!res.ok))
      .catch(() => setServerDown(true));
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">{serverDown ? <CloudOff /> : <TriangleAlert />}</EmptyMedia>
          <EmptyTitle>{serverDown ? "Can't reach the server" : "Something went wrong"}</EmptyTitle>
          <EmptyDescription>
            {serverDown
              ? "HomeFix is not answering right now. It may be restarting. Your data is safe: wait a moment, then try again."
              : "This page hit an unexpected problem. Your data is safe. Try again, or go back to the start."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button onClick={() => retry()}>Try again</Button>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Go to start
          </Link>
        </EmptyContent>
      </Empty>
    </div>
  );
}
