"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggleButton } from "@/components/theme/theme-toggle";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function AppearanceSettingsCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const current = mounted ? theme ?? "system" : "system";

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the admin panel looks on this device.
          </CardDescription>
        </div>
        <CardAction>
          <ThemeToggleButton className="size-9" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div role="radiogroup" aria-label="Theme" className="mb-4">
          <div className="inline-flex w-full max-w-xs rounded-lg bg-muted p-1 sm:w-auto">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = current === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Your preference is saved on this device and applies across the admin
          panel automatically.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          {current === "system"
            ? "Following your system theme."
            : current === "dark"
              ? "Using the dark theme."
              : "Using the light theme."}
        </p>
      </CardContent>
    </Card>
  );
}
