import Link from "next/link";
import { Wrench } from "lucide-react";

// Layout for login, register and password pages. Top-aligned (not vertically centered)
// so the card doesn't jump when validation errors appear.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-6 bg-muted/40 px-4 pt-10 pb-10 sm:pt-24">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wrench className="size-4" />
        </span>
        HomeFix
      </Link>
      {children}
    </div>
  );
}
