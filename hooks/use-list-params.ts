"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// List state (search text, page, filters) lives in the URL, so reload, back button and
// shared links keep the same view. Changing anything except `page` resets to page 1.
export function useListParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = (key: string) => searchParams.get(key) ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const set = useCallback(
    (changes: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(changes)) {
        if (v === undefined || v === "" || (k === "page" && v === 1)) next.delete(k);
        else next.set(k, String(v));
      }
      if (!("page" in changes)) next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return { get, page, set };
}
