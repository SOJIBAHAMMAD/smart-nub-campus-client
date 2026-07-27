"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  UserPlus,
  Check,
  X,
  MessageSquare,
  Star,
  MoreVertical,
  Ban,
  UserMinus,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardAction,
} from "@/components/ui/card";
import { TagPill } from "@/components/ui/tag-pill";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ConnectionStatusBadge,
  type Relationship,
} from "./connection-status-badge";
import { ConnectionNoteDialog } from "./connection-note-dialog";
import { cn } from "@/lib/utils";
import ROUTES from "@/constants/routes";
import { messageClientService } from "@/services/message.client.service";
import {
  sendConnectionRequestAction,
  acceptConnectionAction,
  rejectConnectionAction,
  cancelConnectionAction,
  toggleFavoriteAction,
  removeConnectionAction,
  blockUserAction,
  unblockUserAction,
} from "@/actions/connection.actions";

export interface PeopleCardUser {
  id: string;
  name: string;
  email?: string;
  image?: string | null;
  department?: string | null;
  currentSemester?: number | null;
  admissionSemester?: string | null;
  student?: {
    department?: string | null;
    admissionYear?: number;
    admissionSemester?: string | null;
  } | null;
  profile?: {
    currentSemester?: number | null;
    batchYear?: number | null;
  } | null;
  userSkills?: { tag: { id: string; name: string; slug: string } }[];
  skills?: { tag: { id: string; name: string; slug: string } }[] | string[];
  mutualConnections?: number;
  connectionStatus?:
    | "NONE"
    | "CONNECTED"
    | "PENDING_INCOMING"
    | "PENDING_OUTGOING";
  connectionId?: string | null;
}

interface PeopleCardProps {
  user: PeopleCardUser;
  relationship?: Relationship;
  connectionId?: string;
  direction?: "incoming" | "outgoing" | "none";
  isFavorite?: boolean;
  showMutual?: boolean;
  compact?: boolean;
  onChanged?: () => void;
  onUnblock?: () => void;
  note?: string | null;
}

function skillName(skill: unknown): string {
  if (typeof skill === "string") return skill;
  const s = skill as { tag?: { name: string }; name?: string };
  return s.tag?.name ?? s.name ?? "";
}

const DEPARTMENT_ACCENTS: Record<string, string> = {
  CSE: "from-violet-500/10 to-violet-500/3",
  "Computer Science & Engineering": "from-violet-500/10 to-violet-500/3",
  EEE: "from-amber-500/10 to-amber-500/3",
  "Electrical & Electronic Engineering": "from-amber-500/10 to-amber-500/3",
  BBA: "from-sky-500/10 to-sky-500/3",
  "Business Administration": "from-sky-500/10 to-sky-500/3",
  English: "from-emerald-500/10 to-emerald-500/3",
  "English & Modern Languages": "from-emerald-500/10 to-emerald-500/3",
  Architecture: "from-rose-500/10 to-rose-500/3",
  Law: "from-indigo-500/10 to-indigo-500/3",
};

function getAccentClass(dept: string | null): string {
  if (!dept) return "";
  return DEPARTMENT_ACCENTS[dept] ?? "from-primary/10 to-primary/3";
}

export function PeopleCard({
  user,
  relationship = "none",
  connectionId,
  direction: _direction = "none",
  isFavorite: initialFavorite = false,
  showMutual = false,
  compact = false,
  onChanged,
  onUnblock,
  note,
}: PeopleCardProps) {
  const [status, setStatus] = useState<Relationship>(relationship);
  const [isFavorited, setIsFavorited] = useState(initialFavorite);
  const [busy, setBusy] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [messagePending, startMessageTransition] = useTransition();
  const router = useRouter();

  const department = user.department ?? user.student?.department ?? null;
  const currentSemester =
    user.currentSemester ?? user.profile?.currentSemester ?? null;
  const rawSkills =
    user.userSkills ??
    (user.skills as
      | { tag: { id: string; name: string; slug: string } }[]
      | undefined);

  const mutual = showMutual && user.mutualConnections
    ? user.mutualConnections
    : 0;

  const run = async (
    key: string,
    fn: () => Promise<{ success: boolean; message: string }>,
  ) => {
    setBusy(key);
    try {
      const res = await fn();
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setActionSuccess(key);
      setTimeout(() => setActionSuccess(null), 1500);
      onChanged?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  const handleConnect = (reqNote?: string) =>
    run("connect", async () => {
      const res = await sendConnectionRequestAction(user.id, reqNote);
      if (res.success) {
        setStatus("pending_outgoing");
        setDialogOpen(false);
      }
      return res;
    });

  const handleAccept = () =>
    run("accept", async () => {
      const res = await acceptConnectionAction(connectionId!);
      if (res.success) setStatus("connected");
      return res;
    });

  const handleReject = () =>
    run("reject", async () => {
      const res = await rejectConnectionAction(connectionId!);
      if (res.success) setStatus("none");
      return res;
    });

  const handleCancel = () =>
    run("cancel", async () => {
      const res = await cancelConnectionAction(connectionId!);
      if (res.success) setStatus("none");
      return res;
    });

  const handleToggleFavorite = async () => {
    if (!connectionId) return;
    setBusy("fav");
    try {
      const res = await toggleFavoriteAction(connectionId);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      const nowFavorited = !isFavorited;
      setIsFavorited(nowFavorited);
      toast.success(nowFavorited ? "Added to favorites" : "Removed from favorites");
      onChanged?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  const handleRemove = () =>
    run("remove", async () => {
      const res = await removeConnectionAction(connectionId!);
      if (res.success) setStatus("none");
      return res;
    });

  const handleBlock = () =>
    run("block", async () => {
      const res = await blockUserAction(user.id);
      if (res.success) setStatus("blocked");
      return res;
    });

  const handleUnblockLocal = () =>
    run("unblock", async () => {
      const res = await unblockUserAction(user.id);
      if (res.success) setStatus("none");
      return res;
    });

  const handleMessage = () => {
    startMessageTransition(async () => {
      try {
        const conversation = await messageClientService.createConversation({
          participantId: user.id,
        });
        router.push(ROUTES.CONVERSATION(conversation.id));
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to start conversation.",
        );
      }
    });
  };

  const handleCardClick = () => {
    router.push(ROUTES.USER_PROFILE(user.id));
  };

  const skills = (rawSkills ?? []).map(skillName).filter(Boolean);
  const accent = getAccentClass(department);
  const maxSkills = compact ? 2 : 3;
  const extraSkills = Math.max(0, skills.length - maxSkills);

  return (
    <Card
      ref={cardRef}
      size={compact ? "sm" : "default"}
      className={cn(
        "relative transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-lg",
        compact && "hover:-translate-y-0",
      )}
    >
      {accent && (
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
            accent,
          )}
        />
      )}

      <CardHeader className="gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <button
          type="button"
          className="flex flex-1 cursor-pointer items-start gap-3 text-left"
          onClick={handleCardClick}
        >
          <div className="relative shrink-0">
            <Avatar
              id={user.id}
              name={user.name}
              src={user.image}
              className={compact ? "size-10" : "size-12"}
            />
            {status === "connected" && (
              <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background bg-emerald-500" />
            )}
            {status === "pending_incoming" && (
              <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background bg-amber-500" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "font-semibold text-foreground leading-snug group-data-[interactive]/card:transition-colors group-data-[interactive]/card:group-hover/card:text-primary",
                compact ? "text-sm" : "text-[15px]",
              )}
            >
              {user.name}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {[
                department,
                currentSemester ? `Sem ${currentSemester}` : null,
              ]
                .filter(Boolean)
                .join(" \u00b7 ") || "NUB Student"}
            </p>
          </div>
        </button>

        <CardAction>
          <ConnectionStatusBadge relationship={status} />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3 px-4 pb-4 sm:px-5 sm:pb-5">
        {skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {skills.slice(0, maxSkills).map((skill) => (
              <TagPill
                key={skill}
                name={skill}
                size="xs"
                variant="brand"
                showIcon={false}
              />
            ))}
            {extraSkills > 0 && (
              <span className="text-[10px] font-medium text-muted-foreground">
                +{extraSkills} more
              </span>
            )}
          </div>
        )}

        {mutual > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {Array.from({ length: Math.min(mutual, 3) }).map((_, i) => (
                <div
                  key={i}
                  className="size-5 rounded-full border-2 border-background bg-muted ring-1 ring-border/50"
                  style={{ zIndex: 3 - i }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {mutual} mutual connection{mutual === 1 ? "" : "s"}
            </span>
          </div>
        )}

        {note && (
          <div className="rounded-lg border border-border/40 bg-muted/40 px-3 py-2">
            <p className="text-xs italic text-muted-foreground line-clamp-2">
              &ldquo;{note}&rdquo;
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          {/* ── Not connected ──────────────────────────────────── */}
          {status === "none" && (
            <Button
              size="sm"
              onClick={() => setDialogOpen(true)}
              disabled={busy === "connect"}
              className={cn(
                "transition-all duration-200",
                actionSuccess === "connect" &&
                  "bg-emerald-500 hover:bg-emerald-600",
              )}
            >
              {actionSuccess === "connect" ? (
                <>
                  <Check className="size-3.5" />
                  Sent!
                </>
              ) : (
                <>
                  <UserPlus className="size-3.5" />
                  Connect
                </>
              )}
            </Button>
          )}

          {/* ── Pending incoming ───────────────────────────────── */}
          {status === "pending_incoming" && connectionId && (
            <>
              <Button
                size="sm"
                onClick={handleAccept}
                disabled={busy === "accept"}
                className={cn(
                  "transition-all duration-200",
                  actionSuccess === "accept" &&
                    "bg-emerald-500 hover:bg-emerald-600",
                )}
              >
                {actionSuccess === "accept" ? (
                  <>
                    <Check className="size-3.5" />
                    Connected!
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    Accept
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleReject}
                disabled={busy === "reject"}
              >
                <X className="size-3.5" />
                Decline
              </Button>
            </>
          )}

          {/* ── Pending outgoing ───────────────────────────────── */}
          {status === "pending_outgoing" && connectionId && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCancel}
              disabled={busy === "cancel"}
            >
              <X className="size-3.5" />
              Cancel Request
            </Button>
          )}

          {/* ── Blocked ────────────────────────────────────────── */}
          {status === "blocked" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onUnblock ?? handleUnblockLocal}
              disabled={busy === "unblock"}
            >
              <Ban className="size-3.5" />
              Unblock
            </Button>
          )}

          {/* ── Connected ──────────────────────────────────────── */}
          {status === "connected" && (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleMessage}
                disabled={messagePending}
              >
                <MessageSquare className="size-3.5" />
                {messagePending ? "Opening..." : "Message"}
              </Button>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleToggleFavorite}
                      disabled={busy === "fav"}
                      className={cn(
                        "transition-colors",
                        isFavorited
                          ? "text-amber-500 hover:text-amber-600"
                          : "text-muted-foreground hover:text-amber-500",
                      )}
                    />
                  }
                >
                  <Star className={cn("size-3.5", isFavorited && "fill-amber-500")} />
                </TooltipTrigger>
                <TooltipContent>
                  {isFavorited ? "Remove from favorites" : "Add to favorites"}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRemove}
                      disabled={busy === "remove"}
                      className="text-muted-foreground hover:text-destructive"
                    />
                  }
                >
                  <UserMinus className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>Remove connection</TooltipContent>
              </Tooltip>

              {/* Kebab: only for connected state with 2+ destructive actions */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    />
                  }
                  aria-label="More actions"
                >
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={4}>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleBlock}
                  >
                    <Ban className="size-3.5" />
                    Block User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </CardContent>

      <ConnectionNoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={user}
        onSend={handleConnect}
        busy={busy === "connect"}
      />
    </Card>
  );
}
