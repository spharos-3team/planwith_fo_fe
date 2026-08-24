"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { InputField } from "@/components/common/InputField";
import {
  DATE_PRESET_OPTIONS,
  type DatePreset,
  presetLabel,
  rangeForPreset,
} from "@/features/meeting/lib/date-range";
import { formatMeetingPeriod } from "@/features/meeting/lib/format";

interface MeetingDateRangePickerProps {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}

export function MeetingDateRangePicker({
  from,
  to,
  onChange,
}: MeetingDateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<DatePreset>(
    from || to ? "custom" : "all"
  );
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const triggerLabel =
    preset === "all"
      ? "날짜 선택"
      : preset === "custom"
        ? formatMeetingPeriod(from || null, to || null) || "직접 입력"
        : presetLabel(preset);

  const selectPreset = (next: DatePreset) => {
    setPreset(next);

    if (next === "custom") {
      setCustomFrom(from);
      setCustomTo(to);
      return;
    }

    onChange(rangeForPreset(next));
    setOpen(false);
  };

  const applyCustom = (nextFrom: string, nextTo: string) => {
    setCustomFrom(nextFrom);
    setCustomTo(nextTo);

    if (nextFrom && nextTo) {
      const ordered =
        nextFrom <= nextTo
          ? { from: nextFrom, to: nextTo }
          : { from: nextTo, to: nextFrom };
      onChange(ordered);
    }
  };

  return (
    <div
      className="relative grid w-full gap-1.5 lg:max-w-[22rem]"
      ref={rootRef}
    >
      <span className="text-label-sm text-text-primary">날짜</span>
      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-11 w-full items-center justify-between rounded-sm border border-line-default bg-surface-default px-4 text-left text-body-sm outline-none transition hover:border-brand-primary focus:border-brand-primary"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span
          className={
            preset === "all" ? "text-text-disabled" : "text-text-primary"
          }
        >
          {triggerLabel}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="h-4 w-4 text-text-disabled"
        />
      </button>
      {open ? (
        <div
          className="absolute left-0 top-full z-30 mt-2 w-full rounded-lg border border-line-light bg-white p-2 shadow-[0_8px_24px_rgb(15_23_42/0.08)]"
          id={menuId}
          role="listbox"
        >
          {DATE_PRESET_OPTIONS.map((option) => {
            const selected = preset === option.value;

            return (
              <button
                aria-selected={selected}
                className={`flex h-[38px] w-full items-center rounded-md px-3.5 text-left text-body-sm transition ${
                  selected
                    ? "bg-blue-ice font-semibold text-brand-primary"
                    : "text-text-primary hover:bg-surface-page"
                }`}
                key={option.value}
                onClick={() => selectPreset(option.value)}
                role="option"
                type="button"
              >
                {option.label}
              </button>
            );
          })}
          {preset === "custom" ? (
            <div className="mt-2 grid gap-2 border-t border-line-light px-1 pt-3">
              <InputField
                label="시작일"
                onChange={(event) => applyCustom(event.target.value, customTo)}
                type="date"
                value={customFrom}
              />
              <InputField
                label="종료일"
                onChange={(event) =>
                  applyCustom(customFrom, event.target.value)
                }
                type="date"
                value={customTo}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
