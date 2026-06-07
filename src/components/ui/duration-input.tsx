"use client";

import { useState, useEffect, useRef } from "react";

interface DurationInputProps {
  name: string;
  defaultSeconds?: number;
  onChange?: (seconds: number) => void;
  required?: boolean;
}

function secondsToHMS(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { h, m, s };
}

/**
 * Input visual de duração no formato HH:MM:SS.
 * Internamente emite um <input type="hidden" name={name} value={totalSegundos}>.
 */
export function DurationInput({
  name,
  defaultSeconds,
  onChange,
  required,
}: DurationInputProps) {
  const init = defaultSeconds ? secondsToHMS(defaultSeconds) : { h: 0, m: 0, s: 0 };

  const [hours, setHours] = useState(init.h);
  const [minutes, setMinutes] = useState(init.m);
  const [seconds, setSeconds] = useState(init.s);

  const minutesRef = useRef<HTMLInputElement>(null);
  const secondsRef = useRef<HTMLInputElement>(null);

  const total = hours * 3600 + minutes * 60 + seconds;

  useEffect(() => {
    onChange?.(total);
  }, [total, onChange]);

  function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(max, isNaN(val) ? 0 : val));
  }

  function handleHours(v: string) {
    const n = clamp(parseInt(v) || 0, 0, 23);
    setHours(n);
    if (v.length >= 2) minutesRef.current?.focus();
  }

  function handleMinutes(v: string) {
    const n = clamp(parseInt(v) || 0, 0, 59);
    setMinutes(n);
    if (v.length >= 2) secondsRef.current?.focus();
  }

  function handleSeconds(v: string) {
    setSeconds(clamp(parseInt(v) || 0, 0, 59));
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={total > 0 ? total : ""} />
      <div className="flex items-center rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 px-3 py-2 gap-1 w-full">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          value={pad(hours)}
          onChange={(e) => handleHours(e.target.value)}
          onFocus={(e) => e.target.select()}
          aria-label="Horas"
          required={required && total === 0}
          className="w-8 bg-transparent text-center text-sm font-mono outline-none"
        />
        <span className="text-muted-foreground font-mono select-none">:</span>
        <input
          ref={minutesRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          value={pad(minutes)}
          onChange={(e) => handleMinutes(e.target.value)}
          onFocus={(e) => e.target.select()}
          aria-label="Minutos"
          className="w-8 bg-transparent text-center text-sm font-mono outline-none"
        />
        <span className="text-muted-foreground font-mono select-none">:</span>
        <input
          ref={secondsRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          value={pad(seconds)}
          onChange={(e) => handleSeconds(e.target.value)}
          onFocus={(e) => e.target.select()}
          aria-label="Segundos"
          className="w-8 bg-transparent text-center text-sm font-mono outline-none"
        />
        <span className="text-xs text-muted-foreground ml-1 select-none">
          hh:mm:ss
        </span>
      </div>
    </div>
  );
}
