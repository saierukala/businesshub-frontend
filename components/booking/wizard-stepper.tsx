import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Numbered steps of the booking wizard. Finished steps can be clicked to go back (later choices are kept
// unless an earlier change makes them invalid; the wizard clears those itself).
export function WizardStepper({ steps, current, onBack }: { steps: string[]; current: number; onBack: (step: number) => void }) {
  return (
    <>
      {/* Phones: one line and a bar. */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{steps[current]}</span>
          <span className="text-muted-foreground">
            Step {current + 1} of {steps.length}
          </span>
        </div>
        <div className="mt-2 flex gap-1" aria-hidden>
          {steps.map((s, i) => (
            <div key={s} className={cn("h-1.5 flex-1 rounded-full", i <= current ? "bg-primary" : "bg-muted")} />
          ))}
        </div>
      </div>

      <ol className="hidden items-center gap-2 sm:flex" aria-label="Booking steps">
        {steps.map((label, i) => {
          const done = i < current;
          const now = i === current;
          return (
            <li key={label} className="flex flex-1 items-center gap-2" aria-current={now ? "step" : undefined}>
              <button
                type="button"
                disabled={!done}
                onClick={() => onBack(i)}
                className={cn("flex min-w-0 items-center gap-2 rounded-lg py-1 pr-2 text-left text-sm", done && "hover:text-primary")}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                    done && "border-primary bg-primary text-primary-foreground",
                    now && "border-primary text-primary ring-4 ring-primary/15",
                    !done && !now && "border-border text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span className={cn("truncate", now ? "font-semibold" : done ? "" : "text-muted-foreground")}>{label}</span>
              </button>
              {i < steps.length - 1 && <span className={cn("h-0.5 min-w-4 flex-1 rounded-full", done ? "bg-primary" : "bg-border")} aria-hidden />}
            </li>
          );
        })}
      </ol>
    </>
  );
}
