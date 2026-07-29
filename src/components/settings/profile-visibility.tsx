"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updatePrivacySettingsAction } from "@/actions/settings.actions";
import type { UserSettings, ProfileVisibilityLevel } from "@/types";

interface ProfileVisibilityProps {
  settings: UserSettings;
}

const VISIBILITY_OPTIONS: { value: ProfileVisibilityLevel; label: string }[] = [
  { value: "EVERYONE", label: "Everyone" },
  { value: "STUDENTS_ONLY", label: "Students Only" },
  { value: "CONNECTIONS_ONLY", label: "Connections Only" },
  { value: "ONLY_ME", label: "Only Me" },
];

const VISIBILITY_FIELDS = [
  { key: "showProfile" as const, label: "Profile" },
  { key: "showAcademicInfo" as const, label: "Academic Info" },
  { key: "showSkills" as const, label: "Skills" },
  { key: "showProjects" as const, label: "Projects" },
  { key: "showReputation" as const, label: "Reputation" },
  { key: "showBadges" as const, label: "Badges" },
  { key: "showSocialLinks" as const, label: "Social Links" },
];

/**
 * Profile visibility settings with dropdowns for each profile section.
 */
export function ProfileVisibility({ settings }: ProfileVisibilityProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);

  const handleChange = async (
    field: keyof UserSettings,
    value: ProfileVisibilityLevel,
  ) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
    setSaving(true);

    try {
      const result = await updatePrivacySettingsAction({ [field]: value });
      if (result.success) {
        toast.success("Visibility updated.");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to update visibility.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Profile Visibility</CardTitle>
        <p className="text-sm text-muted-foreground">
          Control who can see each section of your profile.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {VISIBILITY_FIELDS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <Label className="text-sm">{label}</Label>
            <Select
              value={localSettings[key]}
              onValueChange={(v) => handleChange(key, v as ProfileVisibilityLevel)}
              disabled={saving}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
