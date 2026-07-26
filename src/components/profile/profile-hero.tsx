"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Pencil, Check, X, Camera, Loader2, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUpload } from "@/hooks/use-upload";
import { updateProfile } from "@/actions/profile.actions";
import { toast } from "sonner";
import type { ProfileUser } from "@/types/profile.types";
import { DEPARTMENT_LABELS, type Department } from "@/lib/constants";

interface ProfileHeroProps {
  profileData: ProfileUser;
  isOwnProfile: boolean;
  onProfileUpdate: () => void;
}

export function ProfileHero({ profileData, isOwnProfile, onProfileUpdate }: ProfileHeroProps) {
  const { name, image, student, profile } = profileData;
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationValue, setLocationValue] = useState(profile?.location ?? "");
  const [isPending, startTransition] = useTransition();

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { upload: uploadCover, isUploading: isUploadingCover } = useUpload({
    context: "uploads",
    type: "image",
  });
  const { upload: uploadAvatar, isUploading: isUploadingAvatar } = useUpload({
    context: "avatars",
    type: "image",
  });

  const departmentLabel = student
    ? DEPARTMENT_LABELS[student.department as Department] ?? student.department
    : null;

  const handleSaveLocation = () => {
    startTransition(async () => {
      await updateProfile({ location: locationValue || undefined });
      setIsEditingLocation(false);
      onProfileUpdate();
    });
  };

  const handleCancelLocation = () => {
    setLocationValue(profile?.location ?? "");
    setIsEditingLocation(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadCover(file);
      await updateProfile({ coverImage: result.url });
      toast.success("Cover photo updated");
      onProfileUpdate();
    } catch {
      toast.error("Failed to upload cover photo");
    }
    e.target.value = "";
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadAvatar(file);
      await updateProfile({ image: result.url });
      toast.success("Profile photo updated");
      onProfileUpdate();
    } catch {
      toast.error("Failed to upload profile photo");
    }
    e.target.value = "";
  };

  return (
    <Card className="relative overflow-hidden">
      {/* Hidden file inputs */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleCoverUpload}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleAvatarUpload}
      />

      {/* Cover */}
      <div className="relative">
        {profile?.coverImage ? (
          <Image
            src={profile.coverImage}
            alt="Cover"
            width={1200}
            height={300}
            className="h-32 w-full object-cover sm:h-48"
            unoptimized
          />
        ) : (
          <div className="h-32 w-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 sm:h-48" />
        )}

        {/* Top-right buttons */}
        {isOwnProfile && (
          <div className="absolute right-3 top-3 flex gap-2">
            <Link
              href="/settings/profile"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border/50 bg-background/80 px-2.5 text-xs font-medium shadow-sm backdrop-blur-sm transition-colors hover:bg-background/95"
            >
              <Settings className="size-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border/50 bg-background/80 px-2.5 text-xs font-medium shadow-sm backdrop-blur-sm transition-colors hover:bg-background/95 disabled:opacity-50"
            >
              {isUploadingCover ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Camera className="size-3.5" />
              )}
              <span className="hidden sm:inline">
                {profile?.coverImage ? "Change cover" : "Add cover"}
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="relative px-4 pb-5 sm:px-6">
        {/* Avatar */}
        <div className="-mt-10 flex items-end gap-4">
          <div className="relative">
            <Avatar
              id={profileData.id}
              name={name}
              src={image}
              className="size-20 border-4 border-card sm:size-24"
            />
            {/* Avatar upload overlay */}
            {isOwnProfile && (
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-colors hover:bg-muted disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Camera className="size-3" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Name & Info */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{name}</h1>
            {profileData.gender && (
              <Badge variant="secondary" className="text-xs capitalize">
                {profileData.gender.toLowerCase().replace("_", " ")}
              </Badge>
            )}
          </div>

          {student && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{departmentLabel}</Badge>
              <span className="text-xs">ID: {student.studentId}</span>
              <span className="text-xs">
                Batch {student.admissionYear} — {student.admissionSemester}
              </span>
            </div>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {profile?.currentSemester && (
              <span className="flex items-center gap-1">
                Semester {profile.currentSemester}
              </span>
            )}
            {profile?.batchYear && (
              <span>Batch {profile.batchYear}</span>
            )}

            {/* Location — inline editable */}
            {isOwnProfile && isEditingLocation ? (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                <Input
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveLocation();
                    if (e.key === "Escape") handleCancelLocation();
                  }}
                  placeholder="Your location"
                  className="h-6 w-36 text-xs"
                  disabled={isPending}
                  autoFocus
                />
                <button
                  type="button"
                  className="inline-flex size-5 items-center justify-center rounded-md text-green-600 hover:bg-muted"
                  onClick={handleSaveLocation}
                  disabled={isPending}
                >
                  <Check className="size-3" />
                </button>
                <button
                  type="button"
                  className="inline-flex size-5 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={handleCancelLocation}
                  disabled={isPending}
                >
                  <X className="size-3" />
                </button>
              </span>
            ) : (
              <span
                className={
                  isOwnProfile
                    ? "flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 transition-colors hover:bg-muted hover:text-foreground"
                    : "flex items-center gap-1"
                }
                onClick={() => isOwnProfile && setIsEditingLocation(true)}
              >
                <MapPin className="size-3" />
                {profile?.location || (isOwnProfile ? "Add location" : "")}
                {isOwnProfile && !profile?.location && (
                  <Pencil className="size-2.5 text-muted-foreground/50" />
                )}
              </span>
            )}

            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              Joined {new Date(profileData.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
