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
import type {
  UserSettings,
  ConnectionRequestPolicy,
  MessagingPolicy,
} from "@/types";

interface PrivacySettingsProps {
  settings: UserSettings;
}

const CONNECTION_POLICIES: { value: ConnectionRequestPolicy; label: string }[] = [
  { value: "EVERYONE", label: "Everyone" },
  { value: "SAME_DEPARTMENT", label: "Same Department" },
  { value: "SAME_BATCH", label: "Same Batch" },
  { value: "MUTUAL_CONNECTIONS", label: "Mutual Connections" },
  { value: "NOBODY", label: "No One" },
];

const MESSAGING_POLICIES: { value: MessagingPolicy; label: string }[] = [
  { value: "EVERYONE", label: "Everyone" },
  { value: "CONNECTIONS", label: "Connections Only" },
  { value: "DEPARTMENT", label: "Same Department" },
  { value: "NOBODY", label: "No One" },
];

const TOGGLE_FIELDS = [
  { key: "allowMessageRequests" as const, label: "Allow Message Requests" },
  { key: "showOnlineStatus" as const, label: "Show Online Status" },
  { key: "showLastActive" as const, label: "Show Last Active" },
  { key: "readReceipts" as const, label: "Read Receipts" },
  { key: "searchableProfile" as const, label: "Searchable Profile" },
  { key: "appearInRecommendations" as const, label: "Appear in Recommendations" },
];

/**
 * Privacy settings: connection/messaging policies, online status, searchability.
 */
export function PrivacySettings({ settings }: PrivacySettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);

  const handleSelectChange = async (
    field: keyof UserSettings,
    value: string | null,
  ) => {
    if (value === null) return;
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
    setSaving(true);

    try {
      const result = await updatePrivacySettingsAction({ [field]: value });
      if (result.success) {
        toast.success("Privacy setting updated.");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to update privacy setting.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (field: keyof UserSettings) => {
    const newValue = !localSettings[field];
    setLocalSettings((prev) => ({ ...prev, [field]: newValue }));

    try {
      const result = await updatePrivacySettingsAction({ [field]: newValue });
      if (result.success) {
        toast.success("Privacy setting updated.");
      } else {
        toast.error(result.message);
        setLocalSettings((prev) => ({ ...prev, [field]: !newValue }));
      }
    } catch {
      toast.error("Failed to update privacy setting.");
      setLocalSettings((prev) => ({ ...prev, [field]: !newValue }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Request Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connection Requests</CardTitle>
          <p className="text-sm text-muted-foreground">
            Control who can send you connection requests.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">Who can send requests</Label>
            <Select
              value={localSettings.connectionRequestPolicy}
              onValueChange={(v) => handleSelectChange("connectionRequestPolicy", v)}
              disabled={saving}
            >
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONNECTION_POLICIES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messaging Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Messaging</CardTitle>
          <p className="text-sm text-muted-foreground">
            Control who can send you messages.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">Who can message me</Label>
            <Select
              value={localSettings.messagingPolicy}
              onValueChange={(v) => handleSelectChange("messagingPolicy", v)}
              disabled={saving}
            >
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MESSAGING_POLICIES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Toggle Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visibility & Privacy</CardTitle>
          <p className="text-sm text-muted-foreground">
            Control your online presence and discoverability.
          </p>
        </CardHeader>
        <CardContent className="space-y-0">
          {TOGGLE_FIELDS.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <Label className="text-sm">{label}</Label>
              <button
                type="button"
                role="switch"
                aria-checked={localSettings[key] as boolean}
                onClick={() => handleToggle(key)}
                disabled={saving}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                  localSettings[key] ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                    localSettings[key]
                      ? "translate-x-4"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
