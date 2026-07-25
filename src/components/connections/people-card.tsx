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
  ConnectionStatusBadge,
  type Relationship,
} from "./connection-status-badge";
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
import { cn } from "@/lib/utils";

export interface PeopleCardUser {
  id: string;
  name: string;
  email?: string;
  image?: string | null;
  /** Top-level (used by suggestions/transformed data). */
  department?: string | null;
  currentSemester?: number | null;
  admissionSemester?: string | null;
  /** Backend nested shape (otherUser / search result). */
  student?: {
    department?: string | null;
    admissionYear?: number;
    admissionSemester?: string | null;
  } | null;
  profile?: {
    currentSemester?: number | null;
    batchYear?: number | null;
  } | null;
  /** Backend nested skills (search results). */
  userSkills?: { tag: { id: string; name: string; slug: string } }[];
  skills?: { tag: { id: string; name: string; slug: string } }[] | string[];
  mutualConnections?: number;
  /** Relationship of the current user to this person (server-resolved). */
  connectionStatus?:
    | "NONE"
    | "CONNECTED"
    | "PENDING_INCOMING"
    | "PENDING_OUTGOING";
  /** Connection record id when a pending/established connection exists. */
  connectionId?: string | null;
}

interface PeopleCardProps {
  user: PeopleCardUser;
  /** Relationship from the current user's perspective. */
  relationship?: Relationship;
  /** Connection record id when an existing connection/pending row exists. */
  connectionId?: string;
  /** Tag describing the relationship context (e.g. "incoming" pending). */
  direction?: "incoming" | "outgoing" | "none";
  /** Show the mutual connections line. */
  showMutual?: boolean;
  /** Compact rendering for sidebar suggestions. */
  compact?: boolean;
  /** Callback fired after a successful mutation (to refresh lists). */
  onChanged?: () => void;
  /** Callback to unblock this user (shown when relationship is "blocked"). */
  onUnblock?: () => void;
  /** Optional note attached to the connection request (e.g. from the sender). */
  note?: string | null;
}

function skillName(skill: unknown): string {
  if (typeof skill === "string") return skill;
  const s = skill as { tag?: { name: string }; name?: string };
  return s.tag?.name ?? s.name ?? "";
}

/**
 * People card used across the Connections page — discoverable people, suggested
 * people, and pending/established connections. Renders the appropriate action
 * buttons based on the current relationship and performs optimistic mutations.
 */
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
  const [noteOpen, setNoteOpen] = useState(false);
  const [connectNote, setConnectNote] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  // Close the "more actions" menu on outside click or Escape.
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

  // Resolve fields that arrive nested from the backend (otherUser / search
  // results) as well as the flattened shape used by suggestions.
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
        setNoteOpen(false);
        setConnectNote("");
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
    <div
      ref={cardRef}
      className={cn(
        "group relative flex gap-3 rounded-xl border bg-card p-4 ring-1 ring-foreground/10 transition-shadow hover:shadow-md",
        compact && "p-3",
      )}
    >
      <Avatar
        id={user.id}
        name={user.name}
        src={user.image}
        className={compact ? "size-9" : "size-11"}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {[department, currentSemester ? `Sem ${currentSemester}` : null]
                .filter(Boolean)
                .join(" · ") || "NUB Student"}
            </p>
          </div>
          {!compact && <ConnectionStatusBadge relationship={status} />}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {skills.slice(0, compact ? 2 : 4).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {mutual && (
          <p className="mt-2 text-xs text-muted-foreground">{mutual}</p>
        )}

        {note && (
          <p className="mt-2 rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs italic text-muted-foreground">
            “{note}”
          </p>
        )}

        {/* Actions */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {status === "none" && (
            <>
              <Button
                size="sm"
                onClick={() =>
                  handleConnect(
                    noteOpen ? connectNote.trim() || undefined : undefined,
                  )
                }
                disabled={busy === "connect"}
              >
                <UserPlus className="size-3.5" />
                {noteOpen && connectNote.trim() ? "Send Request" : "Connect"}
              </Button>
              <Button
                size="sm"
                variant={noteOpen ? "secondary" : "ghost"}
                onClick={() => setNoteOpen((v) => !v)}
                title="Add a note to your request"
              >
                <MessageSquare className="size-3.5" />
                Note
              </Button>
              {noteOpen && (
                <textarea
                  value={connectNote}
                  onChange={(e) => setConnectNote(e.target.value)}
                  maxLength={500}
                  rows={2}
                  placeholder={`Add a note for ${user.name}…`}
                  className="mt-2 w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              )}
            </>
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
      </div>
    </div>
  );
}
