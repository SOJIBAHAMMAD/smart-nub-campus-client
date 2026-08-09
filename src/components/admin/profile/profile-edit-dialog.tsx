"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";
import { toast } from "sonner";
import type { AdminProfileProfile, AdminProfileUpdatePayload } from "./types";

type ProfileFormKey =
  | "bio"
  | "location"
  | "phoneNumber"
  | "websiteUrl"
  | "githubUrl"
  | "linkedinUrl"
  | "portfolioUrl";

type UrlFieldKey = "websiteUrl" | "githubUrl" | "linkedinUrl" | "portfolioUrl";

interface ProfileFormValues {
  bio: string;
  location: string;
  phoneNumber: string;
  websiteUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
}

const EMPTY_VALUES: ProfileFormValues = {
  bio: "",
  location: "",
  phoneNumber: "",
  websiteUrl: "",
  githubUrl: "",
  linkedinUrl: "",
  portfolioUrl: "",
};

const URL_FIELDS: Array<{
  key: UrlFieldKey;
  label: string;
  placeholder: string;
}> = [
  { key: "websiteUrl", label: "Website", placeholder: "https://yoursite.com" },
  { key: "githubUrl", label: "GitHub", placeholder: "https://github.com/username" },
  { key: "linkedinUrl", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { key: "portfolioUrl", label: "Portfolio", placeholder: "https://yoursite.com/portfolio" },
];

function toFormValues(profile: AdminProfileProfile | null): ProfileFormValues {
  return {
    bio: profile?.bio ?? "",
    location: profile?.location ?? "",
    phoneNumber: profile?.phoneNumber ?? "",
    websiteUrl: profile?.websiteUrl ?? "",
    githubUrl: profile?.githubUrl ?? "",
    linkedinUrl: profile?.linkedinUrl ?? "",
    portfolioUrl: profile?.portfolioUrl ?? "",
  };
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validate(
  values: ProfileFormValues,
): Partial<Record<ProfileFormKey, string>> {
  const errors: Partial<Record<ProfileFormKey, string>> = {};

  if (values.bio.length > 500) {
    errors.bio = "Bio must be 500 characters or fewer.";
  }
  if (values.location.length > 100) {
    errors.location = "Location must be 100 characters or fewer.";
  }
  if (values.phoneNumber.length > 20) {
    errors.phoneNumber = "Phone number must be 20 characters or fewer.";
  }

  for (const field of URL_FIELDS) {
    const value = values[field.key].trim();
    if (value && !isValidHttpUrl(value)) {
      errors[field.key] = "Enter a valid URL starting with http:// or https://";
    }
  }

  return errors;
}

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: AdminProfileProfile | null;
  onSaved: () => void | Promise<void>;
}

/**
 * Edit profile dialog for the admin account. Saves only fields present in the
 * server's `updateProfileSchema` via `PATCH /identity/profile`.
 */
export function ProfileEditDialog({
  open,
  onOpenChange,
  profile,
  onSaved,
}: ProfileEditDialogProps) {
  const [values, setValues] = useState<ProfileFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Partial<Record<ProfileFormKey, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(toFormValues(profile));
      setErrors({});
    }
  }, [open, profile]);

  const setValue = (key: ProfileFormKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      const payload: AdminProfileUpdatePayload = {
        bio: values.bio.trim(),
        location: values.location.trim(),
        phoneNumber: values.phoneNumber.trim(),
        websiteUrl: values.websiteUrl.trim() || undefined,
        githubUrl: values.githubUrl.trim() || undefined,
        linkedinUrl: values.linkedinUrl.trim() || undefined,
        portfolioUrl: values.portfolioUrl.trim() || undefined,
      };

      const response = await apiClient.patch<ApiResponse<AdminProfileProfile>>(
        "/identity/profile",
        payload,
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to save your profile.");
      }

      toast.success("Profile updated successfully.");
      await onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isSaving) onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update the details shown on your profile. Social links are optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="profile-bio">Bio</Label>
            <Textarea
              id="profile-bio"
              value={values.bio}
              onChange={(e) => setValue("bio", e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Tell people about your role and responsibilities..."
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                A short introduction shown on your profile.
              </p>
              <span className="text-xs tabular-nums text-muted-foreground">
                {values.bio.length}/500
              </span>
            </div>
            {errors.bio && <p className="text-sm font-normal text-destructive">{errors.bio}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-location">Location</Label>
              <Input
                id="profile-location"
                value={values.location}
                onChange={(e) => setValue("location", e.target.value)}
                maxLength={100}
                placeholder="Dhaka, Bangladesh"
                autoComplete="off"
              />
              {errors.location && (
                <p className="text-sm font-normal text-destructive">{errors.location}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone">Phone number</Label>
              <Input
                id="profile-phone"
                type="tel"
                value={values.phoneNumber}
                onChange={(e) => setValue("phoneNumber", e.target.value)}
                maxLength={20}
                placeholder="+880 1XXX-XXXXXX"
                autoComplete="off"
              />
              {errors.phoneNumber && (
                <p className="text-sm font-normal text-destructive">{errors.phoneNumber}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            {URL_FIELDS.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={`profile-${field.key}`}>{field.label}</Label>
                <Input
                  id={`profile-${field.key}`}
                  type="text"
                  inputMode="url"
                  value={values[field.key]}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  autoComplete="off"
                />
                {errors[field.key] && (
                  <p className="text-sm font-normal text-destructive">{errors[field.key]}</p>
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
