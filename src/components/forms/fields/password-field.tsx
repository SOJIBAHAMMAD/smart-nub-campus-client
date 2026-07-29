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
  PasswordInput,
  PasswordInputField,
  PasswordInputStrength,
} from "@/components/forms/password-input";

interface PasswordFieldOwnProps {
  label?: React.ReactNode;
  description?: string;
  containerClassName?: string;
  showToggle?: boolean;
  showStrength?: boolean;
  toggleLabel?: { show: string; hide: string };
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
}

type PasswordFieldProps<TFieldValues extends FieldValues> =
  PasswordFieldOwnProps &
    Pick<UseControllerProps<TFieldValues>, "control" | "name" | "rules">;

export function PasswordField<TFieldValues extends FieldValues>({
  control,
  name,
  rules,
  label,
  description,
  containerClassName,
  showToggle,
  showStrength = false,
  toggleLabel,
  placeholder,
  autoComplete,
  disabled,
}: PasswordFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    name: name as FieldPath<TFieldValues>,
    rules,
  });

  return (
    <PasswordInput
      value={String(field.value ?? "")}
      onChange={(val) => field.onChange(val)}
      disabled={disabled}
    >
      <Field className={containerClassName}>
        {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
        <PasswordInputField showToggle={showToggle} toggleLabel={toggleLabel} placeholder={placeholder} autoComplete={autoComplete} />
        {showStrength && <PasswordInputStrength className="mt-2" />}
        {description && <FieldDescription>{description}</FieldDescription>}
        <FieldError errors={[error].filter(Boolean)} />
      </Field>
    </PasswordInput>
  );
}
