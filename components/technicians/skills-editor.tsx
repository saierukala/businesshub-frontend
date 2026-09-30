"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ErrorState, ListSkeleton } from "@/components/common/query-states";
import { SetupCard } from "./setup-card";
import { useCategories } from "@/lib/queries/catalog";
import { useSaveSkills } from "@/lib/queries/technicians";
import type { Technician } from "@/lib/types";

export function SkillsEditor({ technician }: { technician: Technician }) {
  const categories = useCategories();
  const save = useSaveSkills(technician.id);
  const saved = technician.skills.map((s) => s.id);
  const [selected, setSelected] = useState<string[]>(saved);
  const dirty = selected.length !== saved.length || selected.some((id) => !saved.includes(id));

  const toggle = (id: string) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <SetupCard
      title="Skills"
      description="Appliance types this technician can repair. They are only offered bookings for these."
      dirty={dirty}
      pending={save.isPending}
      onSave={() =>
        save.mutate(
          { categoryIds: selected },
          { onSuccess: () => toast.success("Skills saved"), onError: (e) => toast.error(e.message) },
        )
      }
    >
      {categories.isPending ? (
        <ListSkeleton rows={1} />
      ) : categories.isError ? (
        <ErrorState error={categories.error} onRetry={() => categories.refetch()} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.data.items.map((c) => (
            <Button
              key={c.id}
              type="button"
              size="sm"
              variant={selected.includes(c.id) ? "default" : "outline"}
              aria-pressed={selected.includes(c.id)}
              onClick={() => toggle(c.id)}
            >
              {c.name}
            </Button>
          ))}
        </div>
      )}
    </SetupCard>
  );
}
