"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Handshake,
  Info,
  Loader2,
  MapPin,
  MessageSquare,
  Plus,
  Send,
  Star,
  Target,
  Trash2,
  XCircle,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RichTextEditor,
  RichTextEditorContent,
  RichTextEditorToolbar,
} from "@/components/ui/rich-text-editor";
import { stripHtml } from "@/lib/job-utils";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  getMentorshipAction,
  createMentorshipGoalAction,
  updateMentorshipGoalAction,
  deleteMentorshipGoalAction,
  createMentorshipSessionAction,
  updateMentorshipSessionAction,
  listMentorshipMessagesAction,
  sendMentorshipMessageAction,
  completeMentorshipAction,
  endMentorshipAction,
  rateMentorAction,
} from "@/actions/mentorship.actions";
import {
  MentorshipStatus,
  MentorshipGoalStatus,
  MentorshipSessionStatus,
  MeetingPreference,
} from "@/constants/enums";
import ROUTES from "@/constants/routes";
import { cn, toHref } from "@/lib/utils";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import type {
  Mentorship,
  MentorshipGoal,
  MentorshipSession,
  MentorshipMessage,
} from "@/types";
import type { MentorshipMessageEvent } from "@/lib/types/socket-events";
import { toast } from "sonner";

const STATUS_META: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  [MentorshipStatus.ACTIVE]: { label: "Active", variant: "default" },
  [MentorshipStatus.COMPLETED]: { label: "Completed", variant: "secondary" },
  [MentorshipStatus.ENDED]: { label: "Ended", variant: "outline" },
};

const GOAL_STATUS_META: Record<
  string,
  { label: string; icon: "done" | "open" }
> = {
  [MentorshipGoalStatus.ACTIVE]: { label: "In progress", icon: "open" },
  [MentorshipGoalStatus.COMPLETED]: { label: "Completed", icon: "done" },
  [MentorshipGoalStatus.CANCELLED]: { label: "Cancelled", icon: "open" },
};

const SESSION_STATUS_META: Record<string, string> = {
  [MentorshipSessionStatus.SCHEDULED]: "Scheduled",
  [MentorshipSessionStatus.COMPLETED]: "Completed",
  [MentorshipSessionStatus.CANCELLED]: "Cancelled",
};

const MEETING_FORMAT_LABELS: Record<string, string> = {
  [MeetingPreference.ONLINE]: "Online",
  [MeetingPreference.IN_PERSON]: "In person",
  [MeetingPreference.HYBRID]: "Hybrid",
  [MeetingPreference.FLEXIBLE]: "Flexible",
};

function formatDateTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatShortDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface MentorshipDetailClientProps {
  mentorshipId: string;
  initialMentorship: Mentorship | null;
  initialError: string | null;
  userId?: string;
}

export function MentorshipDetailClient({
  mentorshipId,
  initialMentorship,
  initialError,
  userId: _userId,
}: MentorshipDetailClientProps) {
  const { socket, isConnected } = useSocket();

  const [mentorship, setMentorship] = useState<Mentorship | null>(
    initialMentorship,
  );
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(!initialMentorship && !initialError);
  const [activeTab, setActiveTab] = useState<"overview" | "messages">(
    "overview",
  );

  // ── Goals ──────────────────────────────────────────────────────────────
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalDueDate, setGoalDueDate] = useState("");
  const [goalBusy, setGoalBusy] = useState(false);

  // ── Sessions ───────────────────────────────────────────────────────────
  const [sessionOpen, setSessionOpen] = useState(false);
  const [sessionAt, setSessionAt] = useState("");
  const [sessionDuration, setSessionDuration] = useState("60");
  const [sessionFormat, setSessionFormat] = useState<string>(
    MeetingPreference.ONLINE,
  );
  const [sessionLocation, setSessionLocation] = useState("");
  const [sessionAgenda, setSessionAgenda] = useState("");
  const [sessionBusy, setSessionBusy] = useState(false);

  // ── Messages ───────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<MentorshipMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // ── Closure ────────────────────────────────────────────────────────────
  const [completeOpen, setCompleteOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [closingNote, setClosingNote] = useState("");
  const [closing, setClosing] = useState(false);
  const [busyGoalId, setBusyGoalId] = useState<string | null>(null);
  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const [expandedAgendaIds, setExpandedAgendaIds] = useState<Set<string>>(
    new Set(),
  );

  const toggleAgenda = (sessionId: string) => {
    setExpandedAgendaIds((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
  };

  const isActive = mentorship?.status === MentorshipStatus.ACTIVE;
  const isMentor = mentorship?.role === "mentor";
  const other = mentorship?.other ?? null;

  const refresh = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true);
      try {
        const result = await getMentorshipAction(mentorshipId);
        if (result.success && result.data) {
          setMentorship(result.data as Mentorship);
          setError(null);
        } else {
          setError(result.message || "Failed to load mentorship.");
        }
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [mentorshipId],
  );

  useEffect(() => {
    if (!initialMentorship && !initialError) {
      refresh();
    }
  }, [initialMentorship, initialError, refresh]);

  const loadMessages = useCallback(async () => {
    setMessagesLoading(true);
    try {
      const result = await listMentorshipMessagesAction(mentorshipId, 100);
      if (result.success && result.data) {
        setMessages((result.data as { data: MentorshipMessage[] }).data);
      }
    } catch {
      toast.error("Failed to load messages.");
    } finally {
      setMessagesLoading(false);
    }
  }, [mentorshipId]);

  useEffect(() => {
    if (mentorship) {
      loadMessages();
    }
  }, [mentorship, loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, messagesLoading]);

  useSocketEvent(
    socket,
    "mentorship:message",
    (payload: MentorshipMessageEvent) => {
      if (payload.mentorshipId !== mentorshipId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        return [
          ...prev,
          {
            id: payload.id,
            mentorshipId: payload.mentorshipId,
            senderId: payload.senderId,
            sender: payload.sender,
            body: payload.body,
            createdAt: payload.createdAt,
            updatedAt: payload.createdAt,
          },
        ];
      });
    },
  );

  // ── Goal handlers ──────────────────────────────────────────────────────

  const handleAddGoal = async () => {
    if (!goalTitle.trim()) {
      toast.error("Goal needs a title.");
      return;
    }
    setGoalBusy(true);
    try {
      const result = await createMentorshipGoalAction(mentorshipId, {
        title: goalTitle.trim(),
        description: goalDescription.trim() || undefined,
        dueDate: goalDueDate ? new Date(goalDueDate).toISOString() : undefined,
      });
      if (result.success) {
        toast.success("Goal added.");
        setGoalOpen(false);
        setGoalTitle("");
        setGoalDescription("");
        setGoalDueDate("");
        await refresh({ silent: true });
      } else {
        toast.error(result.message || "Failed to add goal.");
      }
    } catch {
      toast.error("Failed to add goal.");
    } finally {
      setGoalBusy(false);
    }
  };

  const handleToggleGoal = async (goal: MentorshipGoal) => {
    setBusyGoalId(goal.id);
    try {
      const nextStatus =
        goal.status === MentorshipGoalStatus.COMPLETED
          ? MentorshipGoalStatus.ACTIVE
          : MentorshipGoalStatus.COMPLETED;
      const result = await updateMentorshipGoalAction(goal.id, {
        status: nextStatus,
      });
      if (result.success) {
        toast.success(
          nextStatus === MentorshipGoalStatus.COMPLETED
            ? "Goal completed. Nice work!"
            : "Goal reopened.",
        );
        await refresh({ silent: true });
      } else {
        toast.error(result.message || "Failed to update goal.");
      }
    } catch {
      toast.error("Failed to update goal.");
    } finally {
      setBusyGoalId(null);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    setBusyGoalId(goalId);
    try {
      const result = await deleteMentorshipGoalAction(goalId);
      if (result.success) {
        toast.success("Goal removed.");
        await refresh({ silent: true });
      } else {
        toast.error(result.message || "Failed to remove goal.");
      }
    } catch {
      toast.error("Failed to remove goal.");
    } finally {
      setBusyGoalId(null);
    }
  };

  // ── Session handlers ───────────────────────────────────────────────────

  const handleScheduleSession = async () => {
    if (!sessionAt) {
      toast.error("Pick a date and time for the session.");
      return;
    }
    setSessionBusy(true);
    try {
      const result = await createMentorshipSessionAction(mentorshipId, {
        scheduledAt: new Date(sessionAt).toISOString(),
        durationMinutes: parseInt(sessionDuration, 10) || 60,
        format: sessionFormat,
        location: sessionLocation.trim() || undefined,
        agenda:
          sessionAgenda && stripHtml(sessionAgenda).length > 0
            ? sessionAgenda
            : undefined,
      });
      if (result.success) {
        toast.success("Session scheduled.");
        setSessionOpen(false);
        setSessionAt("");
        setSessionLocation("");
        setSessionAgenda("");
        await refresh({ silent: true });
      } else {
        toast.error(result.message || "Failed to schedule session.");
      }
    } catch {
      toast.error("Failed to schedule session.");
    } finally {
      setSessionBusy(false);
    }
  };

  const handleSessionStatus = async (
    session: MentorshipSession,
    status: string,
  ) => {
    setBusySessionId(session.id);
    try {
      const result = await updateMentorshipSessionAction(session.id, {
        status,
      });
      if (result.success) {
        toast.success("Session updated.");
        await refresh({ silent: true });
      } else {
        toast.error(result.message || "Failed to update session.");
      }
    } catch {
      toast.error("Failed to update session.");
    } finally {
      setBusySessionId(null);
    }
  };

  // ── Message handlers ───────────────────────────────────────────────────

  const handleSendMessage = async () => {
    const body = messageText.trim();
    if (!body) return;
    setSending(true);
    try {
      const result = await sendMentorshipMessageAction(mentorshipId, { body });
      if (result.success) {
        setMessageText("");
      } else {
        toast.error(result.message || "Failed to send message.");
      }
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  // ── Closure handlers ───────────────────────────────────────────────────

  const handleComplete = async () => {
    setClosing(true);
    try {
      const result = await completeMentorshipAction(mentorshipId, {
        feedback: closingNote.trim() || undefined,
      });
      if (result.success) {
        toast.success("Mentorship completed. Thanks for being part of it!");
        setCompleteOpen(false);
        setClosingNote("");
        await refresh({ silent: true });
      } else {
        toast.error(result.message || "Failed to complete mentorship.");
      }
    } catch {
      toast.error("Failed to complete mentorship.");
    } finally {
      setClosing(false);
    }
  };

  const handleRateMentor = async () => {
    setClosing(true);
    try {
      const result = await rateMentorAction(mentorshipId, {
        rating,
        feedback: feedback.trim() || undefined,
      });
      if (result.success) {
        toast.success("Thanks for rating your mentor!");
        setRateOpen(false);
        setFeedback("");
        setRating(5);
        await refresh({ silent: true });
      } else {
        toast.error(result.message || "Failed to rate mentor.");
      }
    } catch {
      toast.error("Failed to rate mentor.");
    } finally {
      setClosing(false);
    }
  };

  const handleEnd = async () => {
    setClosing(true);
    try {
      const result = await endMentorshipAction(mentorshipId);
      if (result.success) {
        toast.success("Mentorship ended.");
        setEndOpen(false);
        await refresh({ silent: true });
      } else {
        toast.error(result.message || "Failed to end mentorship.");
      }
    } catch {
      toast.error("Failed to end mentorship.");
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !mentorship || !other) {
    return (
      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Handshake className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Mentorship unavailable</EmptyTitle>
          </EmptyHeader>
          <EmptyDescription>
            {error ?? "This mentorship could not be found."}
          </EmptyDescription>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            render={<Link href={ROUTES.MENTORSHIP_RELATIONSHIPS} />}
            nativeButton={false}
          >
            Back to my mentorships
          </Button>
        </Empty>
      </div>
    );
  }

  const statusMeta = STATUS_META[mentorship.status] ?? {
    label: mentorship.status,
    variant: "outline" as const,
  };

  const renderGoal = (goal: MentorshipGoal) => {
    const meta = GOAL_STATUS_META[goal.status] ?? {
      label: goal.status,
      icon: "open" as const,
    };
    const done = goal.status === MentorshipGoalStatus.COMPLETED;
    return (
      <div
        key={goal.id}
        className={cn(
          "flex items-start gap-3 rounded-xl border p-3 transition-colors",
          done
            ? "border-emerald-500/25 bg-emerald-500/5"
            : "border-border/60 hover:border-primary/25",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 size-7 shrink-0 rounded-full text-muted-foreground hover:text-primary"
          onClick={() => handleToggleGoal(goal)}
          disabled={!isActive || busyGoalId === goal.id}
          aria-label={done ? "Reopen goal" : "Mark goal complete"}
        >
          {busyGoalId === goal.id ? (
            <Loader2 className="size-4 animate-spin" />
          ) : done ? (
            <CheckCircle2 className="size-4 text-emerald-500" />
          ) : (
            <Circle className="size-4" />
          )}
        </Button>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-medium",
              done && "text-muted-foreground line-through",
            )}
          >
            {goal.title}
          </p>
          {goal.description && (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {goal.description}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                done
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {done && <CheckCircle2 className="size-3" />}
              {meta.label}
            </span>
            {goal.dueDate && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" />
                Due {formatShortDate(goal.dueDate)}
              </span>
            )}
          </div>
        </div>
        {isActive && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => handleDeleteGoal(goal.id)}
            disabled={busyGoalId === goal.id}
            aria-label="Delete goal"
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>
    );
  };

  const renderSession = (session: MentorshipSession) => {
    const sessionDone = session.status === MentorshipSessionStatus.COMPLETED;
    const sessionCancelled =
      session.status === MentorshipSessionStatus.CANCELLED;
    const locationHref = session.location ? toHref(session.location) : null;
    const agendaExpanded = expandedAgendaIds.has(session.id);
    const agendaLong = stripHtml(session.agenda).length > 150;
    return (
      <div
        key={session.id}
        className={cn(
          "rounded-xl border p-3.5 transition-colors",
          sessionDone
            ? "border-emerald-500/25 bg-emerald-500/5"
            : sessionCancelled
              ? "border-border/60 bg-muted/30"
              : "border-border/60 hover:border-primary/25",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <CalendarDays
                className={cn(
                  "size-3.5 shrink-0",
                  sessionDone ? "text-emerald-500" : "text-primary",
                )}
              />
              {formatDateTime(session.scheduledAt)}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
              <span>
                {MEETING_FORMAT_LABELS[session.format] ?? session.format}
              </span>
              {session.durationMinutes && (
                <span>
                  {"\u00b7"} {session.durationMinutes} min
                </span>
              )}
              {session.location && (
                <span className="inline-flex items-center gap-1">
                  {"\u00b7"}
                  <MapPin className="size-3" />
                  {locationHref ? (
                    <a
                      href={locationHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-primary underline underline-offset-2 hover:opacity-80"
                    >
                      {session.location}
                    </a>
                  ) : (
                    <span className="break-all">{session.location}</span>
                  )}
                </span>
              )}
            </p>
            {session.agenda && (
              <div className="mt-1 space-y-1">
                <div
                  className={cn(
                    "prose prose-sm max-w-none dark:prose-invert",
                    !agendaExpanded && agendaLong && "line-clamp-2",
                  )}
                  dangerouslySetInnerHTML={{ __html: session.agenda }}
                />
                {agendaLong && (
                  <button
                    type="button"
                    onClick={() => toggleAgenda(session.id)}
                    className="flex items-center gap-0.5 text-[10px] font-medium text-primary hover:underline"
                  >
                    {agendaExpanded ? (
                      <>
                        Show less <ChevronUp className="size-3" />
                      </>
                    ) : (
                      <>
                        Read more <ChevronDown className="size-3" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
            {session.notes && (
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Notes: </span>
                {session.notes}
              </p>
            )}
            {session.actionItems && (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">
                  Action items:{" "}
                </span>
                {session.actionItems}
              </p>
            )}
            <p className="mt-1.5 text-[11px] text-muted-foreground/70">
              <Badge
                variant={sessionDone ? "secondary" : "outline"}
                className={cn(
                  sessionDone && "text-emerald-600 dark:text-emerald-400",
                )}
              >
                {SESSION_STATUS_META[session.status] ?? session.status}
              </Badge>
            </p>
          </div>

          {isActive &&
            isMentor &&
            session.status === MentorshipSessionStatus.SCHEDULED && (
              <div className="flex shrink-0 gap-1.5">
                <Button
                  size="xs"
                  variant="outline"
                  className="gap-1"
                  onClick={() =>
                    handleSessionStatus(
                      session,
                      MentorshipSessionStatus.COMPLETED,
                    )
                  }
                  disabled={busySessionId === session.id}
                >
                  {busySessionId === session.id ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-3" />
                  )}
                  Mark done
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  className="gap-1 text-destructive hover:text-destructive"
                  onClick={() =>
                    handleSessionStatus(
                      session,
                      MentorshipSessionStatus.CANCELLED,
                    )
                  }
                  disabled={busySessionId === session.id}
                >
                  {busySessionId === session.id ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <XCircle className="size-3" />
                  )}
                  Cancel
                </Button>
              </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <Link
        href={ROUTES.MENTORSHIP_RELATIONSHIPS}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to mentorships
      </Link>

      {/* Header */}
      <Card className="overflow-hidden">
        <div className="relative h-20 bg-linear-to-r from-primary/20 via-fuchsia-400/15 to-primary/20 sm:h-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,0,0,0.06),transparent_60%)]"
          />
        </div>

        <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-3">
              <Avatar
                id={other.id}
                name={other.name}
                src={other.image}
                className="size-16 shrink-0 ring-4 ring-card"
              />
              <div className="min-w-0 pb-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-bold text-foreground">
                    {other.name}
                  </p>
                  <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                  {isMentor ? (
                    <Badge variant="ghost">You&apos;re the mentor</Badge>
                  ) : (
                    <Badge variant="ghost">Your mentor</Badge>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {isMentor ? "Your mentee" : "Your mentor"}{" "}
                  {other.name.split(" ")[0]} ·{" "}
                  {mentorship.other.student?.department ??
                    mentorship.other.profile?.jobTitle ??
                    "NUB"}
                </p>
              </div>
            </div>

            {isActive && isMentor && (
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCompleteOpen(true)}
                >
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setEndOpen(true)}
                >
                  End
                </Button>
              </div>
            )}

            {!isActive && !isMentor && !mentorship.mentorRating && (
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setRateOpen(true)}
                >
                  <Star className="size-3.5" />
                  Rate your mentor
                </Button>
              </div>
            )}
          </div>

          {isActive && (
            <p className="mt-3 inline-flex max-w-full items-start gap-1.5 rounded-lg border border-primary/15 bg-primary/5 px-2.5 py-1.5 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
              {isMentor
                ? "You drive this mentorship — schedule sessions, track goals, and close it when you're done. Your mentee can add goals and message you anytime."
                : "Your mentor schedules sessions and manages closure. You can add goals and message them anytime."}
            </p>
          )}

          {!isMentor && mentorship.menteeFeedback && (
            <div className="mt-3 rounded-xl border border-border/60 bg-muted/40 p-3.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Star className="size-3.5 text-primary" />
                Closing note from {mentorship.mentor.name.split(" ")[0]}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {mentorship.menteeFeedback}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground/60">
                Private — only you can see this.
              </p>
            </div>
          )}

          {!isActive && !isMentor && !mentorship.mentorRating && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-3">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  How was your mentorship?
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  Your rating helps future students choose a mentor. It is shown
                  as an average on {mentorship.mentor.name.split(" ")[0]}&apos;s
                  profile.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setRateOpen(true)}
              >
                <Star className="size-3.5" />
                Rate now
              </Button>
            </div>
          )}

          {!isActive && !isMentor && mentorship.mentorRating && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
              <Star className="size-3.5 fill-current" />
              You rated {mentorship.mentor.name.split(" ")[0]}{" "}
              {mentorship.mentorRating}/5
            </p>
          )}

          {mentorship.stats.upcomingSession && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
              <CalendarDays className="size-3.5" />
              Next session{" "}
              {formatDateTime(mentorship.stats.upcomingSession.scheduledAt)}
            </p>
          )}
        </CardContent>

        <CardContent className="grid grid-cols-2 gap-4 border-t border-border/60 px-4 py-4 sm:grid-cols-4 sm:px-5">
          <div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-lg font-bold tabular-nums text-foreground">
                {mentorship.stats.completedGoalCount}/
                {mentorship.stats.goalCount}
              </p>
              <p className="text-[11px] text-muted-foreground">goals</p>
            </div>
            {mentorship.stats.goalCount > 0 && (
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-linear-to-r from-primary to-fuchsia-400"
                  style={{
                    width: `${Math.round(
                      (mentorship.stats.completedGoalCount /
                        mentorship.stats.goalCount) *
                        100,
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-lg font-bold tabular-nums text-foreground">
                {mentorship.stats.completedSessionCount}/
                {mentorship.stats.sessionCount}
              </p>
              <p className="text-[11px] text-muted-foreground">sessions</p>
            </div>
            {mentorship.stats.sessionCount > 0 && (
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-linear-to-r from-primary to-fuchsia-400"
                  style={{
                    width: `${Math.round(
                      (mentorship.stats.completedSessionCount /
                        mentorship.stats.sessionCount) *
                        100,
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-lg font-bold tabular-nums text-foreground">
                {mentorship._count.messages}
              </p>
              <p className="text-[11px] text-muted-foreground">messages</p>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-lg font-bold tabular-nums text-foreground">
                {formatShortDate(mentorship.startedAt) ?? "—"}
              </p>
              <p className="text-[11px] text-muted-foreground">started</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "overview" | "messages")
        }
      >
        <TabsList className="w-full justify-start gap-1 rounded-full border border-border bg-card p-1">
          <TabsTrigger
            value="overview"
            className="gap-1.5 rounded-full data-active:shadow-sm"
          >
            <Target className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="messages"
            className="gap-1.5 rounded-full data-active:shadow-sm"
          >
            <MessageSquare className="size-4" />
            Messages
            {mentorship._count.messages > 0 &&
              ` (${mentorship._count.messages})`}
          </TabsTrigger>
        </TabsList>

        {activeTab === "overview" && (
          <div className="mt-4 space-y-4">
            {/* Goals */}
            <Card>
              <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="size-4" />
                  Goals
                </CardTitle>
                {isActive && (
                  <Button
                    size="xs"
                    variant="outline"
                    className="gap-1"
                    onClick={() => setGoalOpen(true)}
                  >
                    <Plus className="size-3" />
                    Add goal
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {mentorship.goals.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    {isActive
                      ? "No goals yet. Add a goal to give this mentorship direction."
                      : "No goals were set for this mentorship."}
                  </p>
                ) : (
                  mentorship.goals.map(renderGoal)
                )}
              </CardContent>
            </Card>

            {/* Sessions */}
            <Card>
              <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CalendarDays className="size-4" />
                  Sessions
                </CardTitle>
                {isActive && isMentor && (
                  <Button
                    size="xs"
                    variant="outline"
                    className="gap-1"
                    onClick={() => setSessionOpen((open) => !open)}
                  >
                    {sessionOpen ? (
                      <XCircle className="size-3" />
                    ) : (
                      <Plus className="size-3" />
                    )}
                    {sessionOpen ? "Close" : "Schedule"}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {sessionOpen && (
                  <div className="rounded-xl border border-primary/20 bg-muted/30 p-3.5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="session-at">Date and time</Label>
                        <Input
                          id="session-at"
                          type="datetime-local"
                          value={sessionAt}
                          onChange={(e) => setSessionAt(e.target.value)}
                          disabled={sessionBusy}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="session-duration">Duration (min)</Label>
                        <Select
                          value={sessionDuration}
                          onValueChange={(v) => setSessionDuration(v ?? "60")}
                        >
                          <SelectTrigger
                            className="w-full"
                            id="session-duration"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["30", "45", "60", "90", "120"].map((d) => (
                              <SelectItem key={d} value={d}>
                                {d} min
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="session-format">Format</Label>
                        <Select
                          value={sessionFormat}
                          onValueChange={(v) =>
                            setSessionFormat(v ?? MeetingPreference.ONLINE)
                          }
                        >
                          <SelectTrigger className="w-full" id="session-format">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(MEETING_FORMAT_LABELS).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="session-location">
                          Location / link (optional)
                        </Label>
                        <Input
                          id="session-location"
                          value={sessionLocation}
                          onChange={(e) => setSessionLocation(e.target.value)}
                          placeholder={
                            sessionFormat === MeetingPreference.IN_PERSON
                              ? "Room or address"
                              : "Video call link"
                          }
                          maxLength={500}
                          disabled={sessionBusy}
                        />
                      </div>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <Label>Agenda (optional)</Label>
                      <RichTextEditor
                        value={sessionAgenda}
                        onChange={setSessionAgenda}
                        placeholder="What should this session cover?"
                      >
                        <RichTextEditorToolbar />
                        <RichTextEditorContent className="min-h-35" />
                      </RichTextEditor>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSessionOpen(false)}
                        disabled={sessionBusy}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleScheduleSession}
                        disabled={sessionBusy}
                      >
                        {sessionBusy ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <CalendarDays className="size-4" />
                        )}
                        Schedule
                      </Button>
                    </div>
                  </div>
                )}
                {mentorship.sessions.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    {isActive && isMentor
                      ? "No sessions yet. Schedule your first session to get started."
                      : isActive
                        ? "No sessions yet. Your mentor will schedule sessions with you."
                        : "No sessions were scheduled."}
                  </p>
                ) : (
                  mentorship.sessions.map(renderSession)
                )}
              </CardContent>
            </Card>

            {/* Original request goals */}
            {mentorship.request.goals.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Target className="size-3.5 text-primary" />
                  Started with these goals
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {mentorship.request.goals.map((g, index) => (
                    <span
                      key={`${mentorship.id}-request-goal-${index}`}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "messages" && (
          <Card className="mt-4">
            <CardContent className="flex h-112 flex-col gap-3 p-0">
              <div
                ref={scrollRef}
                className="flex-1 space-y-3 overflow-y-auto p-4"
              >
                {messagesLoading && messages.length === 0 ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-2/3" />
                    <Skeleton className="h-10 w-1/2" />
                  </div>
                ) : messages.length === 0 ? (
                  <Empty className="py-10">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <MessageSquare className="size-6" />
                      </EmptyMedia>
                      <EmptyTitle>No messages yet</EmptyTitle>
                    </EmptyHeader>
                    <EmptyDescription>
                      {isActive
                        ? "Start the conversation with " + other.name + "."
                        : "This mentorship thread has no messages."}
                    </EmptyDescription>
                  </Empty>
                ) : (
                  messages.map((message) => {
                    const mine = message.senderId === _userId;
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-start gap-2",
                          mine && "flex-row-reverse",
                        )}
                      >
                        <Avatar
                          id={message.sender.id}
                          name={message.sender.name}
                          src={message.sender.image}
                          className="size-7 shrink-0"
                        />
                        <div
                          className={cn(
                            "max-w-[75%] rounded-lg border px-3 py-2",
                            mine
                              ? "border-primary/20 bg-primary/10"
                              : "bg-muted",
                          )}
                        >
                          <p className="text-[11px] font-medium text-muted-foreground">
                            {message.sender.name} ·{" "}
                            {formatDateTime(message.createdAt)}
                          </p>
                          <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed">
                            {message.body}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {isActive && (
                <div className="border-t border-border/60 p-3">
                  <div className="flex items-end gap-2">
                    <Textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={`Message ${other.name.split(" ")[0]}...`}
                      rows={1}
                      className="min-h-9 max-h-32 flex-1 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={sending || !messageText.trim()}
                      aria-label="Send message"
                    >
                      {sending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                    </Button>
                  </div>
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground/70">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        isConnected ? "bg-emerald-500" : "bg-muted",
                      )}
                    />
                    {isConnected ? "Connected" : "Reconnecting"} — messages sync
                    in realtime
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </Tabs>

      {/* ── Add goal dialog ──────────────────────────────────────────── */}
      <Dialog
        open={goalOpen}
        onOpenChange={(open) => !open && setGoalOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a goal</DialogTitle>
            <DialogDescription>
              A clear goal keeps this mentorship focused and measurable.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="goal-title">Title</Label>
              <Input
                id="goal-title"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g. Prepare for technical interviews"
                maxLength={200}
                disabled={goalBusy}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-desc">Description (optional)</Label>
              <Textarea
                id="goal-desc"
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                rows={3}
                maxLength={2000}
                disabled={goalBusy}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-due">Target date (optional)</Label>
              <Input
                id="goal-due"
                type="date"
                value={goalDueDate}
                onChange={(e) => setGoalDueDate(e.target.value)}
                disabled={goalBusy}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGoalOpen(false)}
              disabled={goalBusy}
            >
              Cancel
            </Button>
            <Button onClick={handleAddGoal} disabled={goalBusy}>
              {goalBusy ? <Loader2 className="size-4 animate-spin" /> : null}
              Add goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Complete dialog (mentor) ──────────────────────────────────── */}
      <Dialog
        open={completeOpen}
        onOpenChange={(open) => !open && setCompleteOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete this mentorship</DialogTitle>
            <DialogDescription>
              Thanks for seeing it through! Leave a private closing note for
              your mentee to support their growth. Only they can see it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="complete-note">
                Closing note for your mentee (optional)
              </Label>
              <Textarea
                id="complete-note"
                value={closingNote}
                onChange={(e) => setClosingNote(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="What progress did they make? What should they keep working on?"
                disabled={closing}
              />
              <p className="text-[11px] text-muted-foreground/60">
                Private — only the mentee will see this.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCompleteOpen(false)}
              disabled={closing}
            >
              Cancel
            </Button>
            <Button onClick={handleComplete} disabled={closing}>
              {closing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Complete mentorship
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Rate your mentor dialog (mentee) ───────────────────────────── */}
      <Dialog
        open={rateOpen}
        onOpenChange={(open) => !open && setRateOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate your mentor</DialogTitle>
            <DialogDescription>
              Your rating helps future students choose a mentor. It shows as an
              average on {other.name.split(" ")[0]}&apos;s profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Your rating</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={cn(
                      "rounded p-1 transition-colors hover:scale-110",
                      value <= rating
                        ? "text-amber-400"
                        : "text-muted-foreground/30",
                    )}
                    aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
                  >
                    <Star className="size-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rate-feedback">Feedback (optional)</Label>
              <Textarea
                id="rate-feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="What went well? What could have been better?"
                disabled={closing}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRateOpen(false)}
              disabled={closing}
            >
              Cancel
            </Button>
            <Button onClick={handleRateMentor} disabled={closing}>
              {closing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Star className="size-4" />
              )}
              Submit rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── End confirm dialog ───────────────────────────────────────── */}
      <AlertDialog
        open={endOpen}
        onOpenChange={(open) => !open && setEndOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this mentorship?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the relationship as ended. You can always start a
              new mentorship request later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={closing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEnd}
              disabled={closing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {closing ? <Loader2 className="size-4 animate-spin" /> : null}
              End mentorship
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
