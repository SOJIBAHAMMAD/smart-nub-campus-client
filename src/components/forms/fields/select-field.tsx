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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldOwnProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  containerClassName?: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}

type SelectFieldProps<TFieldValues extends FieldValues> = SelectFieldOwnProps &
  Pick<UseControllerProps<TFieldValues>, "control" | "name" | "rules">;

export function SelectField<TFieldValues extends FieldValues>({
  control,
  name,
  rules,
  label,
  description,
  containerClassName,
  options,
  placeholder,
  disabled,
}: SelectFieldProps<TFieldValues>) {
  const {
    field: { ref: fieldRef, ...fieldProps },
    fieldState: { error },
  } = useController({
    control,
    name: name as FieldPath<TFieldValues>,
    rules,
  });

  const handleValueChange = (value: string | null) => {
    fieldProps.onChange(value ?? "");
  };

  return (
    <Field className={containerClassName}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <Select
        value={fieldProps.value ?? null}
        onValueChange={handleValueChange}
        disabled={disabled}
        aria-invalid={!!error}
      >
        <SelectTrigger
          id={name}
          ref={fieldRef}
          aria-invalid={!!error}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[error].filter(Boolean)} />
    </Field>
  );
}