"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { ProfileHero } from "./profile-hero";
import { ProfileCompletionBanner } from "./profile-completion-banner";
import { ProfileStatsBar } from "./profile-stats-bar";
import { ProfileAboutCard } from "./profile-about-card";
import { ProfileSkillsCard } from "./profile-skills-card";
import { ProfileAcademicCard } from "./profile-academic-card";
import { ProfileBadgesCard } from "./profile-badges-card";
import { ProfileLinksCard } from "./profile-links-card";
import { ProfileEmptyState } from "./profile-empty-state";
import { getPublicProfile } from "@/actions/profile.actions";
import type { ProfileUser } from "@/types/profile.types";

interface ProfileClientProps {
  profileData: ProfileUser;
  currentUserId?: string;
}

export function ProfileClient({ profileData, currentUserId }: ProfileClientProps) {
  const router = useRouter();
  const [previewMode, setPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState<ProfileUser | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const isOwnProfile = currentUserId === profileData.id;
  const showAsOther = previewMode ? false : isOwnProfile;

  const displayData = previewMode && previewData ? previewData : profileData;

  const hasMinimalProfile =
    !profileData.image &&
    !profileData.profile?.bio &&
    !profileData.profile?.githubUrl &&
    !profileData.profile?.linkedinUrl &&
    (profileData.skills?.length ?? 0) === 0;

  const handleProfileUpdate = useCallback(() => {
    router.refresh();
  }, [router]);

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

      {/* Completion Banner — only for own profile when incomplete and not previewing */}
      {isOwnProfile && !previewMode && hasMinimalProfile && (
        <ProfileCompletionBanner
          profileData={profileData}
          onDismiss={handleProfileUpdate}
        />
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

          {/* Badges */}
          <ProfileBadgesCard profileData={displayData} />

          {/* Empty state for new users — hidden in preview mode */}
          {isOwnProfile && !previewMode && hasMinimalProfile && (
            <ProfileEmptyState
              profileData={{ id: profileData.id, name: profileData.name, image: profileData.image }}
            />
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Academic Info */}
          <ProfileAcademicCard profileData={displayData} />

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
