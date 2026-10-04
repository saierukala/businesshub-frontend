"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

// Last safety net: if a page crashes while rendering, show this instead of a blank screen.
// (A failed API call is handled inside each screen with its own "Try again"; this is for real bugs.)
// In this Next.js version the recovery function is called `retry`.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>This page hit an unexpected problem. Your data is safe. Try again, or go back to the start.</EmptyDescription>
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
