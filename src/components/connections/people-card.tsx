"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  UserPlus,
  Check,
  X,
  MessageSquare,
  Star,
  MoreVertical,
  Ban,
  Trash2,
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
  ConnectionStatusBadge,
  type Relationship,
} from "./connection-status-badge";
import { ConnectionNoteDialog } from "./connection-note-dialog";
import { cn } from "@/lib/utils";
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
  showMutual = false,
  compact = false,
  onChanged,
  onUnblock,
  note,
}: PeopleCardProps) {
  const [status, setStatus] = useState<Relationship>(relationship);
  const [busy, setBusy] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

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

  const handleToggleFavorite = () =>
    run("fav", async () => {
      const res = await toggleFavoriteAction(connectionId!);
      return res;
    });

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

  const skills = (rawSkills ?? []).map(skillName).filter(Boolean);
  const accent = getAccentClass(department);
  const maxSkills = compact ? 2 : 3;
  const extraSkills = Math.max(0, skills.length - maxSkills);

  return (
    <Card
      ref={cardRef}
      size={compact ? "sm" : "default"}
      className={cn(
        "relative overflow-hidden transition-all duration-200",
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
        <div className="flex items-start gap-3">
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
                "font-semibold text-foreground leading-snug",
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

          <CardAction>
            <ConnectionStatusBadge relationship={status} />
          </CardAction>
        </div>
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

          {status === "pending_outgoing" && connectionId && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCancel}
              disabled={busy === "cancel"}
            >
              <X className="size-3.5" />
              Cancel
            </Button>
          )}

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

          {status === "connected" && (
            <>
              <Button size="sm" variant="secondary">
                <MessageSquare className="size-3.5" />
                Message
              </Button>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleToggleFavorite}
                      disabled={busy === "fav"}
                      className="text-muted-foreground hover:text-amber-500"
                    />
                  }
                >
                  <Star className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>Toggle favorite</TooltipContent>
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
            </>
          )}

          {(status === "none" || status === "connected") && (
            <div className="relative ml-auto">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      onClick={() => setMenuOpen((v) => !v)}
                    />
                  }
                  aria-label="More actions"
                >
                  <MoreVertical className="size-4" />
                </TooltipTrigger>
                <TooltipContent>More actions</TooltipContent>
              </Tooltip>

              {menuOpen && (
                <div className="absolute right-0 top-full z-10 w-40 overflow-hidden rounded-lg border bg-popover p-1 shadow-lg ring-1 ring-foreground/10">
                  {status === "none" && (
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                      onClick={() => {
                        setMenuOpen(false);
                        handleBlock();
                      }}
                    >
                      <Ban className="size-3.5" />
                      Block
                    </button>
                  )}
                  {status === "connected" && (
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                      onClick={() => {
                        setMenuOpen(false);
                        handleRemove();
                      }}
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
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
