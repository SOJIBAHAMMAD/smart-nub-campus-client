import { useState, useRef, useCallback, useEffect } from "react";
import {
  type FieldValues,
  type FieldPath,
  useController,
  type UseControllerProps,
} from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const MAX_YEAR = new Date().getFullYear();

interface BirthDateFieldOwnProps {
  label?: React.ReactNode;
  disabled?: boolean;
}

type BirthDateFieldProps<TFieldValues extends FieldValues> =
  BirthDateFieldOwnProps &
    Pick<UseControllerProps<TFieldValues>, "control" | "name" | "rules">;

function parseDateParts(value: string): {
  dd: string;
  mm: string;
  yyyy: string;
} {
  if (!value) return { dd: "", mm: "", yyyy: "" };
  const parts = value.split("-");
  if (parts.length === 3) {
    return { yyyy: parts[0], mm: parts[1], dd: parts[2] };
  }
  return { dd: "", mm: "", yyyy: "" };
}

function toFormValue(dd: string, mm: string, yyyy: string): string {
  if (!dd || !mm || !yyyy) return "";
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function validateDate(
  dd: string,
  mm: string,
  yyyy: string
): string | null {
  if (!dd || !mm || !yyyy) return null;
  const m = parseInt(mm, 10);
  const y = parseInt(yyyy, 10);
  const d = parseInt(dd, 10);
  if (m < 1 || m > 12) return "Invalid month";
  if (y < 1900 || y > MAX_YEAR) return `Year must be 1900\u2013${MAX_YEAR}`;
  const maxDay = getDaysInMonth(m, y);
  if (d < 1 || d > maxDay) return "Invalid day for this month";
  return null;
}

const inputClassName = cn(
  "h-9 w-16 rounded-md border border-input bg-transparent px-2.5 py-1 text-center text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
);

const inputClassNameYear = cn(inputClassName, "w-24");

export function BirthDateField<TFieldValues extends FieldValues>({
  control,
  name,
  rules,
  label,
  disabled,
}: BirthDateFieldProps<TFieldValues>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    control,
    name: name as FieldPath<TFieldValues>,
    rules,
  });

  const initial = parseDateParts(value);
  const [dd, setDd] = useState(initial.dd);
  const [mm, setMm] = useState(initial.mm);
  const [yyyy, setYyyy] = useState(initial.yyyy);

  const ddRef = useRef<HTMLInputElement>(null);
  const mmRef = useRef<HTMLInputElement>(null);
  const yyyyRef = useRef<HTMLInputElement>(null);

  const dateError = validateDate(dd, mm, yyyy);

  useEffect(() => {
    const next = toFormValue(dd, mm, yyyy);
    if (next !== value) {
      onChange(next);
    }
  }, [dd, mm, yyyy, value, onChange]);

  const handleDayChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.replace(/\D/g, "").slice(0, 2);
      setDd(v);
      if (v.length === 2) mmRef.current?.focus();
    },
    []
  );

  const handleMonthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.replace(/\D/g, "").slice(0, 2);
      setMm(v);
      if (v.length === 2) yyyyRef.current?.focus();
    },
    []
  );

  const handleYearChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.replace(/\D/g, "").slice(0, 4);
      setYyyy(v);
    },
    []
  );

  const handleKeyDown = useCallback(
    (target: "dd" | "mm" | "yyyy", e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Backspace") return;
      const val = target === "dd" ? dd : target === "mm" ? mm : yyyy;
      if (val.length === 0) {
        e.preventDefault();
        if (target === "mm") ddRef.current?.focus();
        else if (target === "yyyy") mmRef.current?.focus();
      }
    },
    [dd, mm, yyyy]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").trim();

      let match = pasted.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (match) {
        setDd(match[1]);
        setMm(match[2]);
        setYyyy(match[3]);
        yyyyRef.current?.focus();
        return;
      }

      match = pasted.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
      if (match) {
        setYyyy(match[1]);
        setMm(match[2]);
        setDd(match[3]);
        yyyyRef.current?.focus();
        return;
      }

      const digits = pasted.replace(/\D/g, "");
      if (digits.length === 8) {
        setDd(digits.slice(0, 2));
        setMm(digits.slice(2, 4));
        setYyyy(digits.slice(4, 8));
        yyyyRef.current?.focus();
      }
    },
    []
  );

  return (
    <Field>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div className="flex gap-2">
        <input
          ref={ddRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="DD"
          maxLength={2}
          value={dd}
          onChange={handleDayChange}
          onKeyDown={(e) => handleKeyDown("dd", e)}
          onPaste={handlePaste}
          onFocus={() => ddRef.current?.select()}
          disabled={disabled}
          className={inputClassName}
          aria-label="Day"
        />
        <span className="flex items-center text-muted-foreground">/</span>
        <input
          ref={mmRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="MM"
          maxLength={2}
          value={mm}
          onChange={handleMonthChange}
          onKeyDown={(e) => handleKeyDown("mm", e)}
          onPaste={handlePaste}
          onFocus={() => mmRef.current?.select()}
          disabled={disabled}
          className={inputClassName}
          aria-label="Month"
        />
        <span className="flex items-center text-muted-foreground">/</span>
        <input
          ref={yyyyRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="YYYY"
          maxLength={4}
          value={yyyy}
          onChange={handleYearChange}
          onKeyDown={(e) => handleKeyDown("yyyy", e)}
          onPaste={handlePaste}
          onFocus={() => yyyyRef.current?.select()}
          disabled={disabled}
          className={inputClassNameYear}
          aria-label="Year"
        />
      </div>
      {(error || dateError) && (
        <FieldError errors={[error ?? { message: dateError! }]} />
      )}
    </Field>
  );
}