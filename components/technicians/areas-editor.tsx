"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, TriangleAlert, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SetupCard } from "./setup-card";
import { AREA_LIST_ID, AreaHint, AreaOptions } from "@/components/common/area-hint";
import { useSaveAreas } from "@/lib/queries/technicians";
import { useAreas } from "@/lib/queries/areas";
import { closeMatch, describeUse, tidyArea } from "@/lib/areas";
import type { Technician } from "@/lib/types";

export function AreasEditor({ technician }: { technician: Technician }) {
  const save = useSaveAreas(technician.id);
  const queryClient = useQueryClient();
  const known = useAreas().data?.items;
  const [areas, setAreas] = useState<string[]>(technician.areas);
  const [draft, setDraft] = useState("");
  const dirty = areas.length !== technician.areas.length || areas.some((a) => !technician.areas.includes(a));

  function add() {
    const area = tidyArea(draft);
    if (area.length < 2) return;
    setAreas((cur) => (cur.includes(area) ? cur : [...cur, area].sort()));
    setDraft("");
  }

  return (
    <SetupCard
      title="Service areas"
      description="Neighbourhoods this technician covers. Matched against the area in the customer's address."
      dirty={dirty}
      pending={save.isPending}
      onSave={() =>
        save.mutate(
          { areas },
          {
            onSuccess: () => {
              toast.success("Areas saved");
              queryClient.invalidateQueries({ queryKey: ["areas"] });
            },
            onError: (e) => toast.error(e.message),
          },
        )
      }
    >
      <div className="flex flex-col gap-3">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Kondapur"
            aria-label="Add an area"
            maxLength={60}
            list={AREA_LIST_ID}
            autoComplete="off"
          />
          <Button type="submit" variant="outline">
            <Plus /> Add
          </Button>
        </form>
        {known && <AreaOptions areas={known} />}
        <AreaHint value={draft} areas={known} />
        {areas.length === 0 ? (
          <p className="text-sm text-muted-foreground">No areas yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {areas.map((a) => (
              <Badge key={a} variant="secondary" className="gap-1 pr-1">
                {a}
                <button
                  type="button"
                  aria-label={`Remove ${a}`}
                  className="rounded-full p-0.5 hover:bg-foreground/10"
                  onClick={() => setAreas((cur) => cur.filter((x) => x !== a))}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        {/* A saved area no address uses, but close to one that is used, is almost always a typo. */}
        {known &&
          areas.map((a) => {
            const similar = known.find((k) => k.area === a)?.addresses ? undefined : closeMatch(a, known);
            return similar ? (
              <p key={a} role="status" className="flex items-start gap-1.5 text-sm text-amber-700 dark:text-amber-400">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                {a} looks like {similar.area} ({describeUse(similar)}). If it is the same place, remove {a} and add {similar.area}: areas must match exactly.
              </p>
            ) : null;
          })}
      </div>
    </SetupCard>
  );
}
