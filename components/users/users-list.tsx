"use client";

import { useState } from "react";
import { EllipsisVertical, Mail, Power, UserPlus, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { PaginationBar } from "@/components/common/pagination-bar";
import { SearchBox } from "@/components/common/search-box";
import { FormDialog } from "@/components/common/form-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { UserForm } from "./user-form";
import { invitePending, PhoneLink, RoleBadge, UserAvatar, UserStatus } from "./user-bits";
import { useResendInvite, useSetUserActive, useUsers } from "@/lib/queries/users";
import { useListParams } from "@/hooks/use-list-params";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/auth";
import type { StaffUser } from "@/lib/types";

const ROLE_FILTERS: { value: Role | "all"; label: string }[] = [
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

  const resendInvite = (u: StaffUser) =>
    resend.mutate(u.id, {
      onSuccess: () => toast.success(`Invite re-sent to ${u.email}`),
      onError: (err) => toast.error(err.message),
    });

  // Owners can't be deactivated, and nobody deactivates themselves.
  const actions = (u: StaffUser) => {
    const canToggle = u.role !== "OWNER" && u.id !== currentUserId;
    if (!canToggle && !invitePending(u)) return null;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${u.name}`} />}>
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {invitePending(u) && (
            <DropdownMenuItem onClick={() => resendInvite(u)}>
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
    );
  };

  const nameBlock = (u: StaffUser) => (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span className="truncate font-medium">{u.name}</span>
        {u.id === currentUserId && <Badge variant="outline">You</Badge>}
      </div>
      <div className="truncate text-xs text-muted-foreground">{u.email ?? "No email"}</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox value={q} onSearch={(v) => set({ q: v })} label="Search users" placeholder="Search by name or email" />
        <div className="sm:ml-auto">
          <Button onClick={() => setCreating(true)} className="w-full sm:w-auto">
            <UserPlus /> Add staff
          </Button>
        </div>
      </div>

      {/* Role filter: few enough options to show them all as one-tap pills. Scrolls sideways on phones. */}
      <div role="group" aria-label="Filter by role" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {ROLE_FILTERS.map((r) => {
          const on = (role || "all") === r.value;
          return (
            <button
              key={r.value}
              type="button"
              aria-pressed={on}
              onClick={() => set({ role: r.value === "all" ? undefined : r.value })}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                on ? "border-transparent bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {users.isPending ? (
        <ListSkeleton />
      ) : users.isError ? (
        <ErrorState error={users.error} onRetry={() => users.refetch()} />
      ) : users.data.items.length === 0 ? (
        <EmptyState icon={UsersRound} title="No users found" description="Try another search or role." />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-4">Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Added</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.data.items.map((u) => (
                  <TableRow key={u.id} className={cn(!u.active && "opacity-60")}>
                    <TableCell className="py-3 pl-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={u.name} role={u.role} />
                        {nameBlock(u)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={u.role} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <PhoneLink phone={u.phone} />
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-muted-foreground lg:table-cell">{formatDate(u.createdAt)}</TableCell>
                    <TableCell>
                      <UserStatus user={u} />
                    </TableCell>
                    <TableCell className="pr-4">{actions(u)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="flex flex-col gap-2 md:hidden">
            {users.data.items.map((u) => (
              <li key={u.id} className={cn("rounded-xl bg-card p-3 ring-1 ring-foreground/10", !u.active && "opacity-60")}>
                <div className="flex items-start gap-3">
                  <UserAvatar name={u.name} role={u.role} />
                  <div className="min-w-0 flex-1">
                    {nameBlock(u)}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <RoleBadge role={u.role} />
                      <UserStatus user={u} />
                    </div>
                    {u.phone && (
                      <div className="mt-1.5 text-sm">
                        <PhoneLink phone={u.phone} />
                      </div>
                    )}
                  </div>
                  {actions(u)}
                </div>
              </li>
            ))}
          </ul>
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
