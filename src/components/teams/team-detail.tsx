"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Users,
  CalendarClock,
  FolderKanban,
  UserRoundPlus,
  XCircle,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TagPill } from "@/components/ui/tag-pill";
import { AuthorInfo } from "@/components/ui/author-info";

import { cn } from "@/lib/utils";
import { TEAM_STATUS_BADGE } from "@/constants/team";
import {
  applyToTeam,
  reviewTeamApplication,
  updateTeamRequest,
} from "@/actions/team.actions";
import type {
  TeamRequest,
  TeamApplication,
  TeamMember,
} from "@/types/team.types";
import { ApplicationCard } from "@/components/teams/application-card";
import { toast } from "sonner";

interface TeamDetailProps {
  team: TeamRequest;
  /** The current user's id (from session). */
  currentUserId?: string | null;
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

/**
 * Full-width team detail view.
 * Shows header, description, skills, deadline, members, and (author-only) applications.
 * Apply opens a modal (if OPEN and not author/member). Author can edit/close.
 */
export function TeamDetail({ team: initialTeam, currentUserId }: TeamDetailProps) {
  const [team, setTeam] = useState<TeamRequest>(initialTeam);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [submittingApply, setSubmittingApply] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const isAuthor = currentUserId != null && team.creatorId === currentUserId;
  const isMember =
    !!currentUserId &&
    (team.teamMembers ?? []).some((m) => m.userId === currentUserId);
  const statusBadge = TEAM_STATUS_BADGE[team.status];
  const canApply =
    team.status === "OPEN" && !isAuthor && !isMember && !hasApplied;

  async function handleApply() {
    setSubmittingApply(true);
    try {
      const result = await applyToTeam(team.id, { message: applyMessage.trim() || undefined });
      if (result.success) {
        toast.success("Application submitted!");
        setShowApplyModal(false);
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

  async function handleReview(applicationId: string, status: "ACCEPTED" | "REJECTED") {
    setReviewingId(applicationId);
    try {
      const result = await reviewTeamApplication(team.id, applicationId, status);
      if (result.success && result.data) {
        const updated = result.data as TeamApplication;
        toast.success(status === "ACCEPTED" ? "Application accepted." : "Application rejected.");
        setTeam((prev) => ({
          ...prev,
          status: status === "ACCEPTED" && prev.status === "OPEN" ? "OPEN" : prev.status,
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

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:px-6">
      {/* ── Breadcrumb ────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/teams" className="transition-colors hover:text-primary">
          Teams
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="truncate text-foreground">{team.title}</span>
      </nav>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">{team.title}</h1>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                statusBadge.className,
              )}
            >
              {statusBadge.label}
            </span>
          </div>
          {team.projectName && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <FolderKanban className="size-3.5" />
              {team.projectName}
            </p>
          )}
          {team.category && (
            <p className="mt-1 text-xs text-muted-foreground">{team.category}</p>
          )}
        </div>

        {/* ── Action buttons ──────────────────────────────────────── */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {canApply && (
            <Button size="sm" onClick={() => setShowApplyModal(true)}>
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
            <>
              {team.status === "OPEN" && (
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
            </>
          )}
        </div>
      </div>

      {/* ── Description ───────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-foreground">Description</h3>
          <p className="mt-2 whitespace-pre-line text-sm text-foreground/80">
            {team.description}
          </p>
        </CardContent>
      </Card>

      {/* ── Meta: skills, deadline, members ──────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Skills */}
        <Card size="sm">
          <CardContent className="p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {team.teamRequestSkills && team.teamRequestSkills.length > 0 ? (
                team.teamRequestSkills.map((skill) => (
                  <TagPill
                    key={skill.id}
                    name={skill.tag?.name ?? "skill"}
                    size="sm"
                    showIcon={false}
                  />
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No skills listed.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Deadline */}
        <Card size="sm">
          <CardContent className="p-4">
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <CalendarClock className="size-3.5" />
              Deadline
            </h3>
            <p className="text-sm font-medium text-foreground">
              {formatDeadline(team.deadline)}
            </p>
          </CardContent>
        </Card>

        {/* Members count */}
        <Card size="sm">
          <CardContent className="p-4">
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Users className="size-3.5" />
              Members
            </h3>
            <p className="text-sm font-medium text-foreground">
              {team.currentMemberCount}/{team.lookingForCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Members list ─────────────────────────────────────────── */}
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
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
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

      {/* ── Applications (author only) ───────────────────────────── */}
      {isAuthor && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Applications ({team.teamApplications?.length ?? 0})
          </h2>
          <div className="space-y-2">
            {(team.teamApplications ?? []).map((application: TeamApplication) => (
              <ApplicationCard
                key={application.id}
                application={application}
                canReview
                onAccept={(id) => handleReview(id, "ACCEPTED")}
                onReject={(id) => handleReview(id, "REJECTED")}
                reviewing={reviewingId === application.id}
              />
            ))}
            {(!team.teamApplications || team.teamApplications.length === 0) && (
              <p className="rounded-lg border bg-card p-3 text-center text-xs text-muted-foreground ring-1 ring-foreground/10">
                No applications yet.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Apply Modal ───────────────────────────────────────────── */}
      {showApplyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowApplyModal(false)}
        >
          <div
            className="mx-4 w-full max-w-md rounded-xl border bg-card p-6 shadow-xl ring-1 ring-foreground/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Apply to {team.title}
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell the team leader why you&apos;re a great fit.
            </p>
            <textarea
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              placeholder="I have experience with..."
              rows={4}
              maxLength={1000}
              className="mt-3 w-full resize-none rounded-md border bg-transparent px-2.5 py-1.5 text-sm outline-none ring-1 ring-foreground/10 placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              {applyMessage.length}/1000
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowApplyModal(false)}>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
