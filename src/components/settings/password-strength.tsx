"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

/** Password requirement checks. */
function getPasswordChecks(password: string) {
  return [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains number", met: /[0-9]/.test(password) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
  ];
}

/** Visual strength level (0-5). */
function getStrengthLevel(password: string): number {
  return getPasswordChecks(password).filter((c) => c.met).length;
}

const STRENGTH_COLORS = [
  "bg-red-500",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
];

const STRENGTH_LABELS = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];

/**
 * Password strength indicator with requirement checklist.
 */
export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const [showChecks, setShowChecks] = useState(false);
  const level = getStrengthLevel(password);
  const checks = getPasswordChecks(password);

  if (!password) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i < level ? STRENGTH_COLORS[level] : "bg-muted",
              )}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Strength: <span className="font-medium">{STRENGTH_LABELS[level]}</span>
        </p>
      </div>

      {/* Requirements toggle */}
      <button
        type="button"
        onClick={() => setShowChecks(!showChecks)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {showChecks ? "Hide requirements" : "Show requirements"}
      </button>

      {/* Requirements checklist */}
      {showChecks && (
        <ul className="space-y-1">
          {checks.map((check) => (
            <li
              key={check.label}
              className={cn(
                "text-xs flex items-center gap-1.5",
                check.met ? "text-green-600" : "text-muted-foreground",
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
              {check.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
