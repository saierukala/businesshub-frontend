"use client";

import { useState } from "react";
import { EllipsisVertical, Mail, Power, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { PaginationBar } from "@/components/common/pagination-bar";
import { SearchBox } from "@/components/common/search-box";
import { FormDialog } from "@/components/common/form-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { UserForm } from "./user-form";
import { useResendInvite, useSetUserActive, useUsers } from "@/lib/queries/users";
import { useListParams } from "@/hooks/use-list-params";
import { formatPhone } from "@/lib/format";
import type { Role } from "@/lib/auth";
import type { StaffUser } from "@/lib/types";

const ROLE_LABEL: Record<Role, string> = { OWNER: "Owner", MANAGER: "Manager", TECHNICIAN: "Technician", CUSTOMER: "Customer" };
const ROLE_FILTERS = [
  { value: "all", label: "Everyone" },
  { value: "MANAGER", label: "Managers" },
  { value: "TECHNICIAN", label: "Technicians" },
  { value: "CUSTOMER", label: "Customers" },
  { value: "OWNER", label: "Owners" },
];

export function UsersList({ currentUserId }: { currentUserId: string }) {
  const { get, page, set } = useListParams();
  const role = get("role");
  const q = get("q");
  const users = useUsers({ role: role || undefined, q, page });
  const setActive = useSetUserActive();
  const resend = useResendInvite();
  const [creating, setCreating] = useState(false);
  const [toggling, setToggling] = useState<StaffUser | null>(null);

  const addButton = (
    <Button onClick={() => setCreating(true)}>
      <UserPlus /> Add staff
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox value={q} onSearch={(v) => set({ q: v })} label="Search users" placeholder="Search by name or email" />
        <Select items={ROLE_FILTERS} value={role || "all"} onValueChange={(v) => set({ role: v === "all" ? undefined : (v ?? undefined) })}>
          <SelectTrigger className="sm:w-40" aria-label="Filter by role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_FILTERS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="sm:ml-auto">{addButton}</div>
      </div>

      {users.isPending ? (
        <ListSkeleton />
      ) : users.isError ? (
        <ErrorState error={users.error} onRetry={() => users.refetch()} />
      ) : users.data.items.length === 0 ? (
        <EmptyState title="No users found" description="Try another search or role." />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.data.items.map((u) => {
                  const invitePending = !u.hasAccount && u.active && u.role !== "CUSTOMER";
                  const canToggle = u.role !== "OWNER" && u.id !== currentUserId;
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email ?? "No email"}</div>
                      </TableCell>
                      <TableCell>{ROLE_LABEL[u.role]}</TableCell>
                      <TableCell className="hidden whitespace-nowrap md:table-cell">{formatPhone(u.phone)}</TableCell>
                      <TableCell>
                        {!u.active ? (
                          <Badge variant="destructive">Deactivated</Badge>
                        ) : invitePending ? (
                          <Badge variant="secondary">Invite sent</Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {(canToggle || invitePending) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${u.name}`} />}>
                              <EllipsisVertical />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {invitePending && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    resend.mutate(u.id, {
                                      onSuccess: () => toast.success(`Invite re-sent to ${u.email}`),
                                      onError: (err) => toast.error(err.message),
                                    })
                                  }
                                >
                                  <Mail /> Resend invite
                                </DropdownMenuItem>
                              )}
                              {canToggle && (
                                <DropdownMenuItem variant={u.active ? "destructive" : "default"} onClick={() => setToggling(u)}>
                                  <Power /> {u.active ? "Deactivate" : "Reactivate"}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <PaginationBar {...users.data} onPageChange={(p) => set({ page: p })} />
        </>
      )}

      <FormDialog open={creating} onOpenChange={setCreating} title="Add a team member" description="They get an email to set their own password. Technician skills, areas and hours are set up separately.">
        <UserForm onDone={() => setCreating(false)} />
      </FormDialog>

      <ConfirmDialog
        open={toggling !== null}
        onOpenChange={(o) => !o && setToggling(null)}
        title={toggling?.active ? `Deactivate ${toggling.name}?` : `Reactivate ${toggling?.name}?`}
        description={
          toggling?.active
            ? "They are signed out right away and can't log in. Their history is kept. You can reactivate them later."
            : "They will be able to log in again."
        }
        confirmLabel={toggling?.active ? "Deactivate" : "Reactivate"}
        destructive={toggling?.active}
        onConfirm={() =>
          setActive.mutateAsync({ id: toggling!.id, active: !toggling!.active }).then(
            (u) => toast.success(u.active ? `${u.name} reactivated` : `${u.name} deactivated`),
            (err: Error) => {
              toast.error(err.message);
              throw err;
            },
          )
        }
      />
    </div>
  );
}
