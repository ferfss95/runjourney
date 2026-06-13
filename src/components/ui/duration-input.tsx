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

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, isNaN(val) ? 0 : val));
}

function segmentToNumber(str: string, max: number): number {
  if (!str.trim()) return 0;
  return clamp(parseInt(str, 10) || 0, 0, max);
}

function focusAtEnd(el: HTMLInputElement) {
  requestAnimationFrame(() => {
    const pos = el.value.length;
    el.setSelectionRange(pos, pos);
  });
}

/**
 * Input visual de duração no formato HH:MM:SS.
 * Cada segmento aceita até 2 dígitos sem trocar foco automaticamente.
 */
export function DurationInput({
  name,
  defaultSeconds = 0,
  onChange,
  required,
}: DurationInputProps) {
  const init = secondsToHMS(defaultSeconds);

  const [hoursStr, setHoursStr] = useState(
    defaultSeconds > 0 ? pad(init.h) : ""
  );
  const [minutesStr, setMinutesStr] = useState(
    defaultSeconds > 0 ? pad(init.m) : ""
  );
  const [secondsStr, setSecondsStr] = useState(
    defaultSeconds > 0 ? pad(init.s) : ""
  );

  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);
  const secondsRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const total =
    segmentToNumber(hoursStr, 23) * 3600 +
    segmentToNumber(minutesStr, 59) * 60 +
    segmentToNumber(secondsStr, 59);

  useEffect(() => {
    onChangeRef.current?.(total);
  }, [total]);

  function handleSegmentChange(
    raw: string,
    setter: (value: string) => void
  ) {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    setter(digits);
  }

  function formatOnBlur(
    str: string,
    max: number,
    setter: (value: string) => void
  ) {
    setter(pad(segmentToNumber(str, max)));
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    prevRef?: React.RefObject<HTMLInputElement | null>,
    nextRef?: React.RefObject<HTMLInputElement | null>
  ) {
    const el = e.currentTarget;

    if (e.key === "ArrowRight" && el.selectionStart === el.value.length) {
      e.preventDefault();
      nextRef?.current?.focus();
    }

    if (e.key === "ArrowLeft" && el.selectionStart === 0) {
      e.preventDefault();
      prevRef?.current?.focus();
    }

    if (
      e.key === "Backspace" &&
      el.value === "" &&
      el.selectionStart === 0
    ) {
      e.preventDefault();
      prevRef?.current?.focus();
    }
  }

  const segmentClass =
    "w-10 min-w-[2.5rem] bg-transparent text-center text-sm font-mono outline-none placeholder:text-muted-foreground/50";

  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={total > 0 ? total : ""} />
      <div className="flex items-center rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 px-3 py-2 gap-1 w-full">
        <input
          ref={hoursRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={hoursStr}
          onChange={(e) => handleSegmentChange(e.target.value, setHoursStr)}
          onBlur={() => formatOnBlur(hoursStr, 23, setHoursStr)}
          onFocus={(e) => focusAtEnd(e.currentTarget)}
          onKeyDown={(e) => handleKeyDown(e, undefined, minutesRef)}
          aria-label="Horas"
          placeholder="00"
          required={required && total === 0}
          className={segmentClass}
        />
        <span className="text-muted-foreground font-mono select-none">:</span>
        <input
          ref={minutesRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={minutesStr}
          onChange={(e) => handleSegmentChange(e.target.value, setMinutesStr)}
          onBlur={() => formatOnBlur(minutesStr, 59, setMinutesStr)}
          onFocus={(e) => focusAtEnd(e.currentTarget)}
          onKeyDown={(e) => handleKeyDown(e, hoursRef, secondsRef)}
          aria-label="Minutos"
          placeholder="00"
          className={segmentClass}
        />
        <span className="text-muted-foreground font-mono select-none">:</span>
        <input
          ref={secondsRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={secondsStr}
          onChange={(e) => handleSegmentChange(e.target.value, setSecondsStr)}
          onBlur={() => formatOnBlur(secondsStr, 59, setSecondsStr)}
          onFocus={(e) => focusAtEnd(e.currentTarget)}
          onKeyDown={(e) => handleKeyDown(e, minutesRef, undefined)}
          aria-label="Segundos"
          placeholder="00"
          className={segmentClass}
        />
        <span className="text-xs text-muted-foreground ml-1 shrink-0 select-none hidden sm:inline">
          hh:mm:ss
        </span>
      </div>
    </div>
  );
}
