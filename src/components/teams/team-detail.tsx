"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Users,
  CalendarClock,
  FolderKanban,
  UserRoundPlus,
  XCircle,
  Check,
  Bookmark,
  BookmarkCheck,
  Share2,
  Eye,
  Globe,
  MapPin,
  Zap,
  Loader2,
  Pencil,
  Activity,
  Contact,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TagPill } from "@/components/ui/tag-pill";
import { AuthorInfo } from "@/components/ui/author-info";
import { AvatarGroup } from "@/components/ui/avatar-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";
import {
  TEAM_STATUS_BADGE,
  DIFFICULTY_BADGE,
  MEETING_PREFERENCE_BADGE,
  APPLICATION_FIELD_META,
  DEFAULT_APPLICATION_FORM,
  type ApplicationFieldKey,
} from "@/constants/team";
import {
  applyToTeam,
  reviewTeamApplication,
  updateTeamRequest,
  toggleTeamBookmark,
  getTeamRequest,
} from "@/actions/team.actions";
import { getPublicProfile } from "@/actions/profile.actions";
import type {
  TeamRequest,
  TeamApplication,
  TeamMember,
  ApplicationFormConfig,
  ApplicationResponses,
} from "@/types/team.types";
import type { ProfileUser } from "@/types/profile.types";
import { ApplicationCard } from "@/components/teams/application-card";
import { TeamActivityFeed } from "@/components/teams/team-activity-feed";
import { toast } from "sonner";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import { env } from "@/env";

interface TeamDetailProps {
  team: TeamRequest;
  currentUserId?: string | null;
  currentUser?: {
    id: string;
    name: string | null;
    email: string | null;
    image?: string | null;
  } | null;
}

function formatDeadline(deadline?: string | null): string {
  if (!deadline) return "No deadline set";
  const date = new Date(deadline);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getDeadlineUrgency(
  deadline?: string | null,
): "urgent" | "soon" | "normal" {
  if (!deadline) return "normal";
  const diffMs = new Date(deadline).getTime() - Date.now();
  const diffDay = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDay <= 3) return "urgent";
  if (diffDay <= 7) return "soon";
  return "normal";
}

export function TeamDetail({
  team: initialTeam,
  currentUserId,
  currentUser,
}: TeamDetailProps) {
  const [team, setTeam] = useState<TeamRequest>(initialTeam);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [formConfig, setFormConfig] = useState<ApplicationFormConfig | null>(null);
  const [responses, setResponses] = useState<ApplicationResponses>({});
  const [responseErrors, setResponseErrors] = useState<Record<string, string>>({});
  const [profileData, setProfileData] = useState<ProfileUser | null>(null);
  const [submittingApply, setSubmittingApply] = useState(false);
  const [hasApplied, setHasApplied] = useState(() => {
    if (!currentUserId) return false;
    return (initialTeam.teamApplications ?? []).some(
      (a) => a.applicantId === currentUserId && a.status !== "WITHDRAWN",
    );
  });
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(
    initialTeam.isBookmarked ?? false,
  );
  const [bookmarking, setBookmarking] = useState(false);

  const isAuthor = currentUserId != null && team.creatorId === currentUserId;
  const isMember =
    !!currentUserId &&
    (team.teamMembers ?? []).some((m) => m.userId === currentUserId);
  const statusBadge = TEAM_STATUS_BADGE[team.status];
  const canApply =
    team.status === "OPEN" && !isAuthor && !isMember && !hasApplied;
  const deadlineUrgency = getDeadlineUrgency(team.deadline);

  const memberAvatars =
    team.teamMembers?.map((m) => ({
      id: m.userId,
      name: m.user?.name,
      src: m.user?.image,
    })) ?? [];

  // ── Socket.IO room-based real-time updates ─────────────────────
  const socketUrl = env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  const { socket } = useSocket({ url: socketUrl });

  useEffect(() => {
    if (!socket) return;
    socket.emit("team:join", team.id);
    return () => {
      socket.emit("team:leave", team.id);
    };
  }, [socket, team.id]);

  useSocketEvent(
    socket,
    "team:application",
    useCallback(
      (data: { teamRequestId: string }) => {
        if (data.teamRequestId === team.id) {
          toast.info("New application received!");
          getTeamRequest(team.id).then((res) => {
            if (res.success && res.data) {
              setTeam(res.data as TeamRequest);
            }
          });
        }
      },
      [team.id],
    ),
  );

  // ── Profile prefill for the application form ─────────────────────────
  useEffect(() => {
    if (!currentUserId) return;
    getPublicProfile(currentUserId).then((res) => {
      if (res.success && res.data) {
        setProfileData(res.data as ProfileUser);
      }
    }).catch(() => {});
  }, [currentUserId]);

  function resolveFieldValue(
    key: ApplicationFieldKey,
    profile: ProfileUser | null,
  ): string {
    switch (key) {
      case "name":
        return currentUser?.name ?? "";
      case "email":
        return currentUser?.email ?? "";
      case "github":
        return profile?.profile?.githubUrl ?? "";
      case "linkedin":
        return profile?.profile?.linkedinUrl ?? "";
      case "portfolio":
        return profile?.profile?.portfolioUrl ?? "";
      case "website":
        return profile?.profile?.websiteUrl ?? "";
      case "phone":
        return profile?.profile?.phoneNumber ?? "";
      case "location":
        return profile?.profile?.location ?? "";
      case "studentId":
        return profile?.student?.studentId ?? "";
      case "department":
        return profile?.student?.department ?? "";
      case "semester":
        return profile?.profile?.currentSemester != null
          ? String(profile.profile.currentSemester)
          : "";
    }
  }

  async function openApplyDialog() {
    setShowApplyDialog(true);
    const config = team.applicationForm ?? DEFAULT_APPLICATION_FORM;
    setFormConfig(config);

    let profile = profileData;
    if (!profile && currentUserId) {
      const res = await getPublicProfile(currentUserId);
      if (res.success && res.data) {
        profile = res.data as ProfileUser;
        setProfileData(profile);
      }
    }

    const prefill: ApplicationResponses = {};
    for (const field of config.fields) {
      const value = resolveFieldValue(field.key, profile);
      if (value) prefill[field.key] = value;
    }
    setResponses(prefill);
    setApplyMessage("");
    setResponseErrors({});
  }

  function validateResponses(
    config: ApplicationFormConfig,
  ): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const field of config.fields) {
      if (field.required && !(responses[field.key] ?? "").trim()) {
        errors[field.key] = `${APPLICATION_FIELD_META[field.key].label} is required.`;
      }
    }
    for (const question of config.questions) {
      if (question.required && !(responses[question.id] ?? "").trim()) {
        errors[question.id] = "This question is required.";
      }
    }
    return errors;
  }

  async function handleApply() {
    if (!formConfig) return;

    const errors = validateResponses(formConfig);
    if (Object.keys(errors).length > 0) {
      setResponseErrors(errors);
      toast.error("Please fill in the required fields.");
      return;
    }

    setSubmittingApply(true);
    try {
      const cleanResponses = Object.fromEntries(
        Object.entries(responses).filter(([, value]) => value.trim() !== ""),
      );
      const result = await applyToTeam(team.id, {
        message: applyMessage.trim() || undefined,
        responses: Object.keys(cleanResponses).length > 0 ? cleanResponses : undefined,
      });
      if (result.success) {
        toast.success("Application submitted!");
        setShowApplyDialog(false);
        setApplyMessage("");
        setResponses({});
        setFormConfig(null);
        setHasApplied(true);
      } else {
        toast.error(result.message || "Failed to submit application.");
      }
    } catch {
      toast.error("Failed to submit application.");
    } finally {
      setSubmittingApply(false);
    }
  }

  async function handleClose() {
    try {
      const result = await updateTeamRequest(team.id, { status: "CLOSED" });
      if (result.success) {
        toast.success("Team request closed.");
        setTeam((prev) => ({ ...prev, status: "CLOSED" }));
      } else {
        toast.error(result.message || "Failed to close request.");
      }
    } catch {
      toast.error("Failed to close request.");
    }
  }

  async function handleReview(
    applicationId: string,
    status: "ACCEPTED" | "REJECTED",
  ) {
    setReviewingId(applicationId);
    try {
      const result = await reviewTeamApplication(
        team.id,
        applicationId,
        status,
      );
      if (result.success && result.data) {
        const updated = result.data as TeamApplication;
        toast.success(
          status === "ACCEPTED"
            ? "Application accepted."
            : "Application rejected.",
        );
        setTeam((prev) => ({
          ...prev,
          status:
            status === "ACCEPTED" && prev.status === "OPEN"
              ? "OPEN"
              : prev.status,
          currentMemberCount:
            status === "ACCEPTED"
              ? prev.currentMemberCount + 1
              : prev.currentMemberCount,
          teamApplications: (prev.teamApplications ?? []).map((a) =>
            a.id === applicationId ? updated : a,
          ),
        }));
      } else {
        toast.error(result.message || "Failed to review application.");
      }
    } catch {
      toast.error("Failed to review application.");
    } finally {
      setReviewingId(null);
    }
  }

  async function handleBookmark() {
    if (bookmarking) return;
    setBookmarking(true);
    try {
      const result = await toggleTeamBookmark(team.id);
      if (result.success && result.data) {
        const data = result.data as { bookmarked: boolean };
        setIsBookmarked(data.bookmarked);
        setTeam((prev) => ({
          ...prev,
          bookmarkCount: data.bookmarked
            ? prev.bookmarkCount + 1
            : Math.max(0, prev.bookmarkCount - 1),
        }));
        toast.success(data.bookmarked ? "Bookmarked!" : "Bookmark removed.");
      } else {
        toast.error(result.message || "Failed to update bookmark.");
      }
    } catch {
      toast.error("Failed to update bookmark.");
    } finally {
      setBookmarking(false);
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/teams/${team.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/teams" className="transition-colors hover:text-primary">
          Teams
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="truncate text-foreground">{team.title}</span>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="rounded-xl border bg-linear-to-br from-card to-muted/50 p-6 ring-1 ring-foreground/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">
                {team.title}
              </h1>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  statusBadge.className,
                )}
              >
                {statusBadge.label}
              </span>
              {team.difficulty && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    DIFFICULTY_BADGE[team.difficulty].className,
                  )}
                >
                  {DIFFICULTY_BADGE[team.difficulty].label}
                </span>
              )}
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  MEETING_PREFERENCE_BADGE[team.meetingPreference].className,
                )}
              >
                {team.meetingPreference === "ONLINE" ? (
                  <Globe className="size-3" />
                ) : team.meetingPreference === "IN_PERSON" ? (
                  <MapPin className="size-3" />
                ) : (
                  <Zap className="size-3" />
                )}
                {MEETING_PREFERENCE_BADGE[team.meetingPreference].label}
              </span>
            </div>

            {team.projectName && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <FolderKanban className="size-3.5" />
                {team.projectName}
              </p>
            )}
            {team.category && (
              <p className="mt-1 text-xs text-muted-foreground">
                {team.category}
              </p>
            )}

            {/* Creator + Stats */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {team.creator && (
                <AuthorInfo
                  user={{
                    id: team.creator.id,
                    name: team.creator.name ?? "Unknown",
                    image: team.creator.image,
                  }}
                  timestamp={team.createdAt}
                  size="sm"
                />
              )}
              <span className="flex items-center gap-1">
                <Eye className="size-3.5" />
                {team.viewCount} views
              </span>
              <span className="flex items-center gap-1">
                {isBookmarked ? (
                  <BookmarkCheck className="size-3.5 text-brand" />
                ) : (
                  <Bookmark className="size-3.5" />
                )}
                {team.bookmarkCount}
              </span>
              {memberAvatars.length > 0 && (
                <AvatarGroup items={memberAvatars} max={4} size="size-6" />
              )}
            </div>
          </div>

          {/* ── Actions ──────────────────────────────────────── */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={handleShare}
            >
              <Share2 className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn("size-9", isBookmarked && "text-brand")}
              onClick={handleBookmark}
              disabled={bookmarking}
            >
              {isBookmarked ? (
                <BookmarkCheck className="size-4" />
              ) : (
                <Bookmark className="size-4" />
              )}
            </Button>
            {canApply && (
              <Button size="sm" onClick={openApplyDialog}>
                <UserRoundPlus className="size-4" />
                Apply
              </Button>
            )}
            {hasApplied && !isMember && (
              <Button size="sm" variant="outline" disabled>
                Applied
              </Button>
            )}
            {isMember && (
              <Button size="sm" variant="outline" disabled>
                Member
              </Button>
            )}
            {isAuthor && (
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={
                  <Link href={`/teams/${team.id}/edit`}>
                    <Pencil className="size-4" />
                    Edit
                  </Link>
                }
              />
            )}
            {isAuthor && team.status === "OPEN" && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                onClick={handleClose}
              >
                <XCircle className="size-4" />
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Description ──────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-foreground">Description</h3>
          <div
            className="prose prose-sm max-w-none dark:prose-invert [&>pre]:border [&>pre]:border-border [&>mark]:rounded-sm [&>mark]:bg-warm/40 [&>mark]:px-0.5 [&>mark]:text-warm-foreground max-sm:[&>pre]:text-xs"
            dangerouslySetInnerHTML={{ __html: team.description }}
          />
        </CardContent>
      </Card>

      {/* ── Quick Info ──────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Deadline */}
          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 px-2.5 py-1 text-xs",
              deadlineUrgency === "urgent" &&
                "border-destructive/40 bg-destructive/10 text-destructive",
              deadlineUrgency === "soon" &&
                "border-warning/40 bg-warning/10 text-warning",
            )}
          >
            <CalendarClock className="size-3.5" />
            {formatDeadline(team.deadline)}
          </Badge>

          {/* Team size */}
          <Badge variant="outline" className="gap-1.5 px-2.5 py-1 text-xs">
            <Users className="size-3.5" />
            {team.currentMemberCount}/{team.lookingForCount} members
          </Badge>

          {/* Contact */}
          {team.contactInfo && (
            <Badge variant="outline" className="gap-1.5 px-2.5 py-1 text-xs">
              <Contact className="size-3.5" />
              {team.contactInfo}
            </Badge>
          )}
        </div>

        {/* Skills row */}
        {team.teamRequestSkills && team.teamRequestSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {team.teamRequestSkills.map((skill) => (
              <TagPill
                key={skill.id}
                name={skill.tag?.name ?? "skill"}
                size="sm"
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Members ──────────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Members ({team.teamMembers?.length ?? team.currentMemberCount})
        </h2>
        <div className="space-y-2">
          {(team.teamMembers ?? []).map((member: TeamMember) => (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-3 ring-1 ring-foreground/10"
            >
              <AuthorInfo
                user={member.user ?? { id: "", name: "Unknown" }}
                action="Joined"
                timestamp={member.joinedAt}
                size="md"
              />
              <span
                className={cn(
                  "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  member.role === "LEADER"
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {member.role}
              </span>
            </div>
          ))}
          {(!team.teamMembers || team.teamMembers.length === 0) && (
            <p className="rounded-lg border bg-card p-3 text-center text-xs text-muted-foreground ring-1 ring-foreground/10">
              No members yet.
            </p>
          )}
        </div>
      </div>

      {/* ── Applications (author only) ───────────────────────── */}
      {isAuthor && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Applications ({team.teamApplications?.length ?? 0})
          </h2>
          <div className="space-y-2">
            {(team.teamApplications ?? []).map(
              (application: TeamApplication) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  canReview
                  formConfig={team.applicationForm}
                  onAccept={(id) => handleReview(id, "ACCEPTED")}
                  onReject={(id) => handleReview(id, "REJECTED")}
                  reviewing={reviewingId === application.id}
                />
              ),
            )}
            {(!team.teamApplications || team.teamApplications.length === 0) && (
              <p className="rounded-lg border bg-card p-3 text-center text-xs text-muted-foreground ring-1 ring-foreground/10">
                No applications yet.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Activity Feed (author only) ─────────────────────── */}
      {isAuthor && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Activity className="size-5" />
            Activity
          </h2>
          <TeamActivityFeed teamId={team.id} isAuthor={isAuthor} />
        </div>
      )}

      {/* ── Apply Dialog ─────────────────────────────────────── */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply to {team.title}</DialogTitle>
            <DialogDescription>
              Tell the team leader why you&apos;re a great fit. Fields marked
              with <span className="text-destructive">*</span> are required.
              Your info is pre-filled from your profile where available.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Message */}
            <div className="space-y-1.5">
              <Label htmlFor="apply-message">
                Why you&apos;re a great fit
              </Label>
              <Textarea
                id="apply-message"
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
                placeholder="I have experience with..."
                rows={3}
                maxLength={1000}
                className="resize-none"
              />
              <p className="text-right text-[10px] text-muted-foreground">
                {applyMessage.length}/1000
              </p>
            </div>

            {/* Built-in profile fields */}
            {(formConfig?.fields ?? []).map((field) => {
              const meta = APPLICATION_FIELD_META[field.key];
              return (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={`apply-${field.key}`}>
                    {meta.label}{" "}
                    {field.required && (
                      <span className="text-destructive">*</span>
                    )}
                  </Label>
                  <Input
                    id={`apply-${field.key}`}
                    type={meta.inputType}
                    value={responses[field.key] ?? ""}
                    onChange={(e) =>
                      setResponses((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    placeholder={meta.placeholder}
                    maxLength={500}
                  />
                  {responseErrors[field.key] && (
                    <p className="text-[11px] text-destructive">
                      {responseErrors[field.key]}
                    </p>
                  )}
                </div>
              );
            })}

            {/* Custom questions */}
            {(formConfig?.questions ?? []).map((question) => (
              <div key={question.id} className="space-y-1.5">
                <Label htmlFor={`apply-question-${question.id}`}>
                  {question.label}{" "}
                  {question.required && (
                    <span className="text-destructive">*</span>
                  )}
                </Label>
                {question.type === "PARAGRAPH" ? (
                  <Textarea
                    id={`apply-question-${question.id}`}
                    value={responses[question.id] ?? ""}
                    onChange={(e) =>
                      setResponses((prev) => ({
                        ...prev,
                        [question.id]: e.target.value,
                      }))
                    }
                    rows={3}
                    maxLength={5000}
                    className="resize-none"
                  />
                ) : (
                  <Input
                    id={`apply-question-${question.id}`}
                    value={responses[question.id] ?? ""}
                    onChange={(e) =>
                      setResponses((prev) => ({
                        ...prev,
                        [question.id]: e.target.value,
                      }))
                    }
                    maxLength={500}
                  />
                )}
                {responseErrors[question.id] && (
                  <p className="text-[11px] text-destructive">
                    {responseErrors[question.id]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowApplyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={submittingApply}>
              {submittingApply ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="size-4" />
                  Submit Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
