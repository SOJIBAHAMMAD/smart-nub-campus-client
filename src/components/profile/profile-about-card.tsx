"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/actions/profile.actions";
import { toast } from "sonner";
import type { ProfileUser } from "@/types/profile.types";

interface ProfileAboutCardProps {
  profileData: ProfileUser;
  isOwnProfile: boolean;
  onProfileUpdate: () => void;
}

export function ProfileAboutCard({
  profileData,
  isOwnProfile,
  onProfileUpdate,
}: ProfileAboutCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [bioValue, setBioValue] = useState(profileData.profile?.bio ?? "");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateProfile({ bio: bioValue || undefined });
      if (result.success) {
        setIsEditing(false);
        onProfileUpdate();
      } else {
        toast.error(result.message || "Failed to save bio");
      }
    });
  };

  const handleCancel = () => {
    setBioValue(profileData.profile?.bio ?? "");
    setIsEditing(false);
  };

  return (
    <Card id="section-bio">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="size-4" />
          About
        </CardTitle>
        {isOwnProfile && !isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="size-3.5" />
          </Button>
        )}
        {isEditing && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={handleSave}
              disabled={isPending}
            >
              <Check className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={handleCancel}
              disabled={isPending}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={bioValue}
            onChange={(e) => setBioValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            placeholder="Tell others about yourself..."
            className="min-h-25 text-sm"
            maxLength={500}
            disabled={isPending}
            autoFocus
          />
        ) : profileData.profile?.bio ? (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {profileData.profile.bio}
          </p>
        ) : isOwnProfile ? (
          <button
            type="button"
            className="w-full cursor-pointer rounded-md p-2 text-left text-sm text-muted-foreground/60 transition-colors hover:bg-muted hover:text-muted-foreground"
            onClick={() => setIsEditing(true)}
          >
            Add a bio to tell others about yourself...
          </button>
        ) : (
          <p className="text-sm text-muted-foreground/60">No bio added yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
