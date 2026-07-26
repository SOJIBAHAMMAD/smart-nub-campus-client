"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

function checkRequirements(password: string): PasswordRequirement[] {
  return [
    { label: "At least 8 characters", met: password.length >= 8 },
    {
      label: "Includes uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: "Includes lowercase letter",
      met: /[a-z]/.test(password),
    },
    { label: "Includes a number", met: /\d/.test(password) },
  ];
}

export function PasswordRequirements({
  password,
  className,
}: PasswordRequirementsProps) {
  const requirements = checkRequirements(password);

  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-xs font-medium text-muted-foreground">
        Password must contain:
      </p>
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2" role="list">
        {requirements.map((req) => (
          <li
            key={req.label}
            className="flex items-center gap-1.5 text-xs"
          >
            {req.met ? (
              <Check className="size-3.5 shrink-0 text-success" />
            ) : (
              <X className="size-3.5 shrink-0 text-muted-foreground/50" />
            )}
            <span
              className={cn(
                req.met ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
