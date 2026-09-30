"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SetupCard } from "./setup-card";
import { useSaveAreas } from "@/lib/queries/technicians";
import type { Technician } from "@/lib/types";

// Same spelling rule as the backend ("  kondapur " -> "Kondapur"), so the list looks the way it is saved.
const tidy = (v: string) => v.trim().replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function AreasEditor({ technician }: { technician: Technician }) {
  const save = useSaveAreas(technician.id);
  const [areas, setAreas] = useState<string[]>(technician.areas);
  const [draft, setDraft] = useState("");
  const dirty = areas.length !== technician.areas.length || areas.some((a) => !technician.areas.includes(a));

  function add() {
    const area = tidy(draft);
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
        save.mutate({ areas }, { onSuccess: () => toast.success("Areas saved"), onError: (e) => toast.error(e.message) })
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
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Kondapur" aria-label="Add an area" maxLength={60} />
          <Button type="submit" variant="outline">
            <Plus /> Add
          </Button>
        </form>
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
      </div>
    </SetupCard>
  );
}
