"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { ProfileHero } from "./profile-hero";
import { ProfileStatsBar } from "./profile-stats-bar";
import { ProfileAboutCard } from "./profile-about-card";
import { ProfileSkillsCard } from "./profile-skills-card";
import { ProfileAcademicCard } from "./profile-academic-card";
import { ProfileBadgesCard } from "./profile-badges-card";
import { ProfileLinksCard } from "./profile-links-card";
import { ProfileCareerCard } from "./profile-career-card";
import { ProfileEmptyState } from "./profile-empty-state";
import { getPublicProfile } from "@/actions/profile.actions";
import type { ProfileUser } from "@/types/profile.types";

interface ProfileClientProps {
  profileData: ProfileUser;
  currentUserId?: string;
  userRole?: string;
}

export function ProfileClient({
  profileData,
  currentUserId,
  userRole,
}: ProfileClientProps) {
  const router = useRouter();
  const [previewMode, setPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState<ProfileUser | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [dismissedEmptyState, setDismissedEmptyState] = useState(false);

  useEffect(() => {
    const key = `profile-empty-state-dismissed-${profileData.id}`;
    if (localStorage.getItem(key) === "true") {
      setDismissedEmptyState(true);
    }
  }, [profileData.id]);

  const isOwnProfile = currentUserId === profileData.id;
  const showAsOther = previewMode ? false : isOwnProfile;

  const displayData = previewMode && previewData ? previewData : profileData;

  const handleProfileUpdate = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleDismissEmptyState = useCallback(() => {
    const key = `profile-empty-state-dismissed-${profileData.id}`;
    localStorage.setItem(key, "true");
    setDismissedEmptyState(true);
  }, [profileData.id]);

  const togglePreview = useCallback(async () => {
    if (previewMode) {
      setPreviewMode(false);
      setPreviewData(null);
      return;
    }

    setIsLoadingPreview(true);
    try {
      const result = await getPublicProfile(profileData.id, true);
      if (result.success && result.data) {
        setPreviewData(result.data as ProfileUser);
        setPreviewMode(true);
      }
    } catch {
      // Fallback: still enter preview but with full data
      setPreviewMode(true);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [previewMode, profileData.id]);

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      {/* Public View Toggle — only on own profile */}
      {isOwnProfile && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={togglePreview}
            disabled={isLoadingPreview}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors ${
              previewMode
                ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {isLoadingPreview ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Loading...
              </>
            ) : previewMode ? (
              <>
                <EyeOff className="size-3.5" />
                Exit Preview
              </>
            ) : (
              <>
                <Eye className="size-3.5" />
                Public View
              </>
            )}
          </button>
        </div>
      )}

      {/* Hero */}
      <ProfileHero
        profileData={displayData}
        isOwnProfile={showAsOther}
        onProfileUpdate={handleProfileUpdate}
      />

      {/* Stats Bar */}
      <ProfileStatsBar
        stats={displayData.stats}
        contentCounts={displayData.contentCounts}
      />

      {/* Content Grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Left Column */}
        <div className="space-y-4">
          {/* About */}
          <ProfileAboutCard
            profileData={displayData}
            isOwnProfile={showAsOther}
            onProfileUpdate={handleProfileUpdate}
          />

          {/* Skills */}
          <ProfileSkillsCard
            profileData={displayData}
            isOwnProfile={showAsOther}
            onProfileUpdate={handleProfileUpdate}
          />

          {/* Career & Experience — own alumni profile only */}
          {isOwnProfile && (
            <ProfileCareerCard
              currentUserId={currentUserId}
              userRole={userRole}
              onProfileUpdate={handleProfileUpdate}
            />
          )}

          {/* Badges */}
          <ProfileBadgesCard
            profileData={displayData}
            isOwnProfile={isOwnProfile}
          />

          {/* Completion guide for own profile — hides itself at 100% */}
          {isOwnProfile && !previewMode && !dismissedEmptyState && (
            <ProfileEmptyState
              profileData={profileData}
              onDismiss={handleDismissEmptyState}
            />
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Academic Info */}
          <ProfileAcademicCard
            profileData={displayData}
            isOwnProfile={showAsOther}
            onProfileUpdate={handleProfileUpdate}
          />

          {/* Links */}
          <ProfileLinksCard
            profileData={displayData}
            isOwnProfile={showAsOther}
            onProfileUpdate={handleProfileUpdate}
          />

          {/* Member Since */}
          <div className="rounded-xl border px-5 py-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Member since</span>{" "}
            {new Date(displayData.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
