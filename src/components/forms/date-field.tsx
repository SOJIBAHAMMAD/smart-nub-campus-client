import {
  type FieldValues,
  type FieldPath,
  useController,
  type UseControllerProps,
} from "react-hook-form";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarDaysIcon } from "@/components/ui/icons/calendar-days";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

interface DateFieldOwnProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  containerClassName?: string;
  className?: string;
}

type DateFieldProps<TFieldValues extends FieldValues> = DateFieldOwnProps &
  Pick<UseControllerProps<TFieldValues>, "control" | "name" | "rules">;

function formatDateForInput(date: Date | string | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateForDisplay(date: Date | string | undefined): string {
  if (!date) return "Select date";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Select date";
  return d.toLocaleDateString();
}

export function DateField<TFieldValues extends FieldValues>({
  control,
  name,
  rules,
  label,
  description,
  containerClassName,
  className,
}: DateFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    name: name as FieldPath<TFieldValues>,
    rules,
  });

  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(() => {
    if (!field.value) return undefined;
    const d = new Date(field.value);
    return isNaN(d.getTime()) ? undefined : d;
  }, [field.value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      field.onChange(formatDateForInput(date));
      setOpen(false);
    }
  };

  return (
    <Field className={containerClassName}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal border-input outline-input dark:border-input dark:outline-input",
                !field.value && "text-muted-foreground",
                className,
              )}
            >
              <CalendarDaysIcon className="mr-2 h-4 w-4" />
              {formatDateForDisplay(selectedDate)}
            </Button>
          }
        />
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            captionLayout="dropdown"
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[error].filter(Boolean)} />
    </Field>
  );
}
