"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
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
import { formatPhone } from "@/lib/format";

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
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Online account</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.data.items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <Link href={`/staff/customers/${c.id}`} className="hover:underline">
                        {c.name}
                      </Link>
                      {!c.active && (
                        <Badge variant="secondary" className="ml-2">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatPhone(c.phone)}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{c.email ?? "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {c.hasAccount ? <Badge variant="outline">Yes</Badge> : <span className="text-muted-foreground">Phone only</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
