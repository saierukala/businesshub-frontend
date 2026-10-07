"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Refrigerator } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FieldGroup } from "@/components/ui/field";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/query-states";
import { FormDialog } from "@/components/common/form-dialog";
import { TextField } from "@/components/form/text-field";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { showApiError } from "@/lib/form";
import { cn } from "@/lib/utils";
import { useCategories, useSaveCategory, useSetCategoryActive } from "@/lib/queries/catalog";
import { categorySchema, type CategoryInput } from "@/lib/schemas/service";
import type { Category } from "@/lib/types";

function CategoryForm({ category, onDone }: { category?: Category; onDone: () => void }) {
  const save = useSaveCategory();
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category?.name ?? "" },
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit((values) =>
    save.mutateAsync({ id: category?.id, name: values.name }).then(
      () => {
        toast.success(category ? "Appliance type renamed" : "Appliance type added");
        onDone();
      },
      (err) => showApiError(form, err),
    ),
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormAlert message={form.formState.errors.root?.server?.message} />
        <TextField control={form.control} name="name" label="Name" placeholder="Geyser" autoFocus />
        <SubmitButton pending={save.isPending}>{category ? "Save" : "Add appliance type"}</SubmitButton>
      </FieldGroup>
    </form>
  );
}

// Owner: the appliance types HomeFix repairs (technician skills and services are based on these).
// Types are never deleted: turning one off stops new bookings, old bookings and history stay.
export function ApplianceTypes() {
  const categories = useCategories(true);
  const setActive = useSetCategoryActive();
  const [editing, setEditing] = useState<Category | "new" | null>(null);

  const addButton = (
    <Button variant="outline" onClick={() => setEditing("new")}>
      <Plus /> New appliance type
    </Button>
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Appliance types</h2>
          <p className="text-sm text-muted-foreground">
            What HomeFix repairs. Technician skills and services use these. Turn one off to stop new bookings; past jobs stay.
          </p>
        </div>
        {addButton}
      </div>

      {categories.isPending ? (
        <ListSkeleton />
      ) : categories.isError ? (
        <ErrorState error={categories.error} onRetry={() => categories.refetch()} />
      ) : categories.data.items.length === 0 ? (
        <EmptyState icon={Refrigerator} title="No appliance types yet" description="Add the appliances you repair." action={addButton} />
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {categories.data.items.map((c) => (
            <li key={c.id} className={cn("flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10", !c.active && "opacity-70")}>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Refrigerator className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{c.name}</div>
                <div className={cn("text-xs", c.active ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground")}>
                  {c.active ? "Offered" : "Off for new bookings"}
                </div>
              </div>
              <Switch
                checked={c.active}
                aria-label={`${c.name} offered`}
                disabled={setActive.isPending && setActive.variables?.id === c.id}
                onCheckedChange={(active) =>
                  setActive.mutate(
                    { id: c.id, active },
                    {
                      onSuccess: () => toast.success(active ? `${c.name} repairs are offered again` : `${c.name} repairs stopped for new bookings`),
                      onError: (err) => toast.error(err.message),
                    },
                  )
                }
              />
              <Button variant="ghost" size="icon-sm" aria-label={`Rename ${c.name}`} onClick={() => setEditing(c)}>
                <Pencil />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <FormDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? "New appliance type" : "Rename appliance type"}
      >
        {editing !== null && <CategoryForm category={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} />}
      </FormDialog>
    </section>
  );
}
