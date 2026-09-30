"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

type Props = { value: string; onSearch: (q: string) => void; placeholder: string; label: string };

// Waits 300 ms after the last keystroke before searching, instead of one request per key.
export function SearchBox({ value, onSearch, placeholder, label }: Props) {
  const [text, setText] = useState(value);
  const [lastValue, setLastValue] = useState(value);

  // If the URL changes from outside (back button), show that value. Done during render
  // (React's recommended pattern) instead of in an effect, to avoid an extra render.
  if (value !== lastValue) {
    setLastValue(value);
    setText(value);
  }

  useEffect(() => {
    if (text.trim() === value) return;
    const t = setTimeout(() => onSearch(text.trim()), 300);
    return () => clearTimeout(t);
  }, [text, value, onSearch]);

  return (
    <InputGroup className="sm:max-w-sm">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </InputGroup>
  );
}
