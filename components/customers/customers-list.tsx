"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, ChevronRight, Phone, Smartphone, UserPlus } from "lucide-react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { PaginationBar } from "@/components/common/pagination-bar";
import { SearchBox } from "@/components/common/search-box";
import { FormDialog } from "@/components/common/form-dialog";
import { CustomerForm } from "./customer-form";
import { useCustomers } from "@/lib/queries/customers";
import { useListParams } from "@/hooks/use-list-params";
import { formatDate, formatPhone, initials } from "@/lib/format";

export function CustomersList() {
  const router = useRouter();
  const { get, page, set } = useListParams();
  const q = get("q");
  const customers = useCustomers({ q, page });
  const [creating, setCreating] = useState(false);

  const newButton = (
    <Button onClick={() => setCreating(true)}>
      <UserPlus /> New customer
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox
          value={q}
          onSearch={(v) => set({ q: v })}
          label="Search customers"
          placeholder="Search by name, phone or email"
        />
        {newButton}
      </div>

      {customers.isPending ? (
        <ListSkeleton />
      ) : customers.isError ? (
        <ErrorState error={customers.error} onRetry={() => customers.refetch()} />
      ) : customers.data.items.length === 0 ? (
        <EmptyState
          title={q ? `No customers match "${q}"` : "No customers yet"}
          description={q ? "Check the spelling or number, or add them as a new customer." : "Add the first customer who calls or walks in."}
          action={newButton}
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-lg border sm:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Online account</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.data.items.map((c) => (
                  // Stretched link: the name's ::after covers the row, so the whole row is clickable
                  // but it is still a real link (keyboard, middle-click, screen readers).
                  <TableRow key={c.id} className={cn("group relative", !c.active && "opacity-60")}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <CustomerAvatar name={c.name} />
                        <div className="min-w-0">
                          <Link
                            href={`/staff/customers/${c.id}`}
                            className="font-medium after:absolute after:inset-0 group-hover:underline"
                          >
                            {c.name}
                          </Link>
                          {!c.active && (
                            <Badge variant="secondary" className="ml-2">
                              Inactive
                            </Badge>
                          )}
                          <p className="text-xs text-muted-foreground">Since {formatDate(c.createdAt)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      <PhoneLink phone={c.phone} />
                    </TableCell>
                    <TableCell className="hidden max-w-64 md:table-cell">
                      <EmailLine email={c.email} verified={c.emailVerified} />
                    </TableCell>
                    <TableCell>
                      <AccountStatus hasAccount={c.hasAccount} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="flex flex-col gap-2 sm:hidden">
            {customers.data.items.map((c) => (
              <li key={c.id} className={cn("relative rounded-lg border bg-card p-3", !c.active && "opacity-60")}>
                <div className="flex items-start gap-3">
                  <CustomerAvatar name={c.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/staff/customers/${c.id}`} className="truncate font-medium after:absolute after:inset-0">
                        {c.name}
                      </Link>
                      {!c.active && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                    <div className="mt-1 text-sm tabular-nums">
                      <PhoneLink phone={c.phone} />
                    </div>
                    {c.email && (
                      <div className="mt-0.5 text-sm">
                        <EmailLine email={c.email} verified={c.emailVerified} />
                      </div>
                    )}
                    <div className="mt-2">
                      <AccountStatus hasAccount={c.hasAccount} />
                    </div>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                </div>
              </li>
            ))}
          </ul>
          <PaginationBar {...customers.data} onPageChange={(p) => set({ page: p })} />
        </>
      )}

      <FormDialog
        open={creating}
        onOpenChange={setCreating}
        title="New customer"
        description="For customers who call, WhatsApp or walk in. Search first to avoid duplicates."
      >
        <CustomerForm onSaved={(c) => router.push(`/staff/customers/${c.id}`)} />
      </FormDialog>
    </div>
  );
}

function CustomerAvatar({ name }: { name: string }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/10 text-xs font-semibold text-sidebar-primary">
      {initials(name)}
    </span>
  );
}

// relative z-10 lifts the phone link above the row's stretched link, so tapping it calls instead of opening the profile.
function PhoneLink({ phone }: { phone: string | null }) {
  if (!phone) return <span className="text-muted-foreground">—</span>;
  return (
    <a href={`tel:+91${phone}`} className="relative z-10 inline-flex items-center gap-1.5 hover:underline">
      <Phone className="size-3.5 text-muted-foreground" />
      {formatPhone(phone)}
    </a>
  );
}

function EmailLine({ email, verified }: { email: string | null; verified: boolean }) {
  if (!email) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
      <span className="truncate">{email}</span>
      {verified && <BadgeCheck className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-label="Email verified" />}
    </span>
  );
}

function AccountStatus({ hasAccount }: { hasAccount: boolean }) {
  return hasAccount ? (
    <Badge variant="outline" className="gap-1">
      <Smartphone className="size-3" /> Has account
    </Badge>
  ) : (
    <span className="text-sm text-muted-foreground">Phone only</span>
  );
}
