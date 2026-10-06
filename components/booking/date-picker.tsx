"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  value: string; // "YYYY-MM-DD" (an IST calendar day), "" until chosen
  min: string; // earliest allowed day, same format
  max: string; // latest allowed day
  onChange: (day: string) => void;
  placeholder?: string; // shown until a day is chosen
};

// The calendar works with browser-local Date objects. We only ever use their year, month and day
// (never a timestamp), so the browser's timezone cannot move the chosen day.
const toDate = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const toDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const label = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export function DatePicker({ id, value, min, max, onChange, placeholder = "Choose a date" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button id={id} type="button" variant="outline" className={cn("w-full justify-start font-normal sm:w-64", !value && "text-muted-foreground")} />
        }
      >
        <CalendarIcon />
        {value ? label.format(toDate(value)) : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? toDate(value) : undefined}
          defaultMonth={toDate(value || min)}
          disabled={{ before: toDate(min), after: toDate(max) }}
          onSelect={(d) => {
            if (!d) return;
            onChange(toDay(d));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
