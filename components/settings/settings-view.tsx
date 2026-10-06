"use client";

import { useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SIDEBAR_THEMES, applySidebarTheme, type SidebarThemeId } from "@/lib/sidebar-themes";
import { cn } from "@/lib/utils";

const MODES: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

const optionClass = (selected: boolean) =>
  cn(
    "flex flex-col gap-2 rounded-lg border p-1.5 text-left text-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    selected && "border-foreground ring-1 ring-foreground",
  );

// true only in the browser: the saved light/dark choice is unknown while the server renders.
const noop = () => () => {};
function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}

// A tiny drawing of the sidebar in this palette: logo, a few menu lines, the active row.
function SidebarPreview({ swatch }: { swatch: readonly [string, string, string] }) {
  const [bg, fg, primary] = swatch;
  return (
    <div className="flex h-20 flex-col gap-1.5 rounded-md p-2" style={{ backgroundColor: bg }} aria-hidden>
      <div className="flex items-center gap-1.5">
        <span className="size-3 rounded-sm" style={{ backgroundColor: primary }} />
        <span className="h-1.5 w-8 rounded-full" style={{ backgroundColor: fg }} />
      </div>
      <span className="h-1.5 w-10 rounded-full opacity-50" style={{ backgroundColor: fg }} />
      <span className="flex h-3 items-center rounded-sm px-1" style={{ backgroundColor: `color-mix(in srgb, ${fg} 15%, transparent)` }}>
        <span className="h-1.5 w-9 rounded-full" style={{ backgroundColor: fg }} />
      </span>
      <span className="h-1.5 w-7 rounded-full opacity-50" style={{ backgroundColor: fg }} />
    </div>
  );
}

function AppearanceCard() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Light or dark (night) mode. System follows your device.</CardDescription>
      </CardHeader>
      <CardContent>
        <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-3 gap-3 sm:max-w-md">
          {MODES.map((m) => {
            const selected = mounted && theme === m.id;
            return (
              <button key={m.id} type="button" role="radio" aria-checked={selected} onClick={() => setTheme(m.id)} className={optionClass(selected)}>
                <span className="flex h-14 items-center justify-center rounded-md bg-muted">
                  <m.icon className="size-5" />
                </span>
                <span className="flex items-center justify-between px-0.5 pb-0.5">
                  {m.label}
                  {selected && <Check className="size-4" />}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SidebarColorCard({ initial }: { initial: SidebarThemeId }) {
  const [current, setCurrent] = useState(initial);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sidebar color</CardTitle>
        <CardDescription>Changes at once.</CardDescription>
      </CardHeader>
      <CardContent>
        <div role="radiogroup" aria-label="Sidebar color" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SIDEBAR_THEMES.map((t) => {
            const selected = current === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  applySidebarTheme(t.id);
                  setCurrent(t.id);
                }}
                className={optionClass(selected)}
              >
                <SidebarPreview swatch={t.swatch} />
                <span className="flex items-center justify-between px-0.5 pb-0.5">
                  {t.label}
                  {selected && <Check className="size-4" />}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Look-and-feel settings, saved in this browser only (not on the account).
export function SettingsView({ sidebarTheme }: { sidebarTheme: SidebarThemeId }) {
  return (
    <>
      <AppearanceCard />
      <SidebarColorCard initial={sidebarTheme} />
    </>
  );
}
