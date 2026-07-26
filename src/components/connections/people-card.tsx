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
  ConnectionStatusBadge,
  type Relationship,
} from "./connection-status-badge";
import { ConnectionNoteDialog } from "./connection-note-dialog";
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

  const mutual =
    showMutual && user.mutualConnections
      ? `${user.mutualConnections} mutual connection${user.mutualConnections === 1 ? "" : "s"}`
      : "";

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

  const _handleUnblock = () =>
    run("unblock", async () => {
      const res = await unblockUserAction(user.id);
      if (res.success) setStatus("none");
      return res;
    });

  const skills = (rawSkills ?? []).map(skillName).filter(Boolean);

  return (
    <Card ref={cardRef} size={compact ? "sm" : "default"}>
      <CardHeader className="flex-row items-center gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <Avatar
          id={user.id}
          name={user.name}
          src={user.image}
          className={compact ? "size-9" : "size-11"}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {[department, currentSemester ? `Sem ${currentSemester}` : null]
              .filter(Boolean)
              .join(" · ") || "NUB Student"}
          </p>
        </div>
        <CardAction>
          <ConnectionStatusBadge relationship={status} />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3 px-4 pb-4 sm:px-5 sm:pb-5">
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, compact ? 2 : 4).map((skill) => (
              <TagPill
                key={skill}
                name={skill}
                size="xs"
                variant="brand"
                showIcon={false}
              />
            ))}
          </div>
        )}

        {mutual && (
          <p className="text-xs text-muted-foreground">{mutual}</p>
        )}

        {note && (
          <p className="rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs italic text-muted-foreground">
            &ldquo;{note}&rdquo;
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {status === "none" && (
            <Button
              size="sm"
              onClick={() => setDialogOpen(true)}
              disabled={busy === "connect"}
            >
              <UserPlus className="size-3.5" />
              Connect
            </Button>
          )}

          {status === "pending_incoming" && connectionId && (
            <>
              <Button
                size="sm"
                onClick={handleAccept}
                disabled={busy === "accept"}
              >
                <Check className="size-3.5" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleReject}
                disabled={busy === "reject"}
              >
                <X className="size-3.5" />
                Reject
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
              Cancel Request
            </Button>
          )}

          {status === "blocked" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onUnblock?.()}
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
              <Button
                size="sm"
                variant="ghost"
                onClick={handleToggleFavorite}
                disabled={busy === "fav"}
                title="Toggle favorite"
              >
                <Star className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRemove}
                disabled={busy === "remove"}
                title="Remove connection"
              >
                <UserMinus className="size-3.5" />
              </Button>
            </>
          )}

          {(status === "none" || status === "connected") && (
            <button
              type="button"
              className="ml-auto rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More actions"
            >
              <MoreVertical className="size-4" />
            </button>
          )}

          {menuOpen && (
            <div className="absolute right-3 top-12 z-10 w-40 overflow-hidden rounded-lg border bg-popover p-1 shadow-lg ring-1 ring-foreground/10">
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
