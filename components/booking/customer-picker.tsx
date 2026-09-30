"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { FormDialog } from "@/components/common/form-dialog";
import { SearchBox } from "@/components/common/search-box";
import { CustomerForm } from "@/components/customers/customer-form";
import { useCustomers } from "@/lib/queries/customers";
import { formatPhone } from "@/lib/format";
import type { Customer } from "@/lib/types";

// Staff step 1 (spec §9b): find the customer by name or phone, or create one.
// Creating warns about a duplicate phone number (inside CustomerForm).
export function CustomerPicker({ onSelect }: { onSelect: (customer: Customer) => void }) {
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const customers = useCustomers({ q: q || undefined });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox value={q} onSearch={setQ} label="Search customers" placeholder="Search by name, phone or email" />
        <Button type="button" variant="outline" className="sm:ml-auto" onClick={() => setCreating(true)}>
          <UserPlus /> New customer
        </Button>
      </div>

      {customers.isPending ? (
        <ListSkeleton rows={3} />
      ) : customers.isError ? (
        <ErrorState error={customers.error} onRetry={() => customers.refetch()} />
      ) : customers.data.items.length === 0 ? (
        <EmptyState title="No customer found" description="Check the number, or create a new customer." />
      ) : (
        <ul className="flex flex-col gap-2">
          {customers.data.items.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c)}
                className="flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border p-3 text-left hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-sm text-muted-foreground">{formatPhone(c.phone)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <FormDialog open={creating} onOpenChange={setCreating} title="New customer" description="For customers who call, WhatsApp or walk in. Search first to avoid duplicates.">
        <CustomerForm
          onSaved={(c) => {
            setCreating(false);
            onSelect(c);
          }}
        />
      </FormDialog>
    </div>
  );
}
