"use client";

import { useQuery } from "@tanstack/react-query";
import { SearchPicker } from "@/components/common/search-picker";
import { api, qs } from "@/lib/api";
import { formatPhone } from "@/lib/format";
import { useCustomer } from "@/lib/queries/customers";
import { useTechnician } from "@/lib/queries/technicians";
import type { Customer, Page, Technician } from "@/lib/types";

// Staff bookings filters. The URL keeps only the id; the name on the button is loaded by id,
// so a reloaded or shared link still shows who is picked.

function useCustomerOptions(q: string, enabled: boolean) {
  const query = useQuery({
    queryKey: ["customers", { q, pageSize: 10 }],
    queryFn: () => api<Page<Customer>>(`/customers${qs({ q: q || undefined, pageSize: 10 })}`),
    enabled,
  });
  return { isPending: query.isPending, options: (query.data?.items ?? []).map((c) => ({ id: c.id, name: c.name, hint: formatPhone(c.phone) })) };
}

function useTechnicianOptions(q: string, enabled: boolean) {
  const query = useQuery({
    queryKey: ["technicians", { q, pageSize: 10 }],
    queryFn: () => api<Page<Technician>>(`/technicians${qs({ q: q || undefined, pageSize: 10 })}`),
    enabled,
  });
  return {
    isPending: query.isPending,
    options: (query.data?.items ?? []).map((t) => ({ id: t.id, name: t.name, hint: t.status === "INACTIVE" ? "Inactive" : undefined })),
  };
}

type Props = { id: string; onChange: (id: string | undefined) => void };

export function CustomerFilter({ id, onChange }: Props) {
  const picked = useCustomer(id);
  return <SearchPicker label="Customer" allLabel="All customers" selected={id ? (picked.data?.name ?? "…") : ""} useOptions={useCustomerOptions} onChange={onChange} />;
}

export function TechnicianFilter({ id, onChange }: Props) {
  const picked = useTechnician(id);
  return <SearchPicker label="Technician" allLabel="All technicians" selected={id ? (picked.data?.name ?? "…") : ""} useOptions={useTechnicianOptions} onChange={onChange} />;
}
