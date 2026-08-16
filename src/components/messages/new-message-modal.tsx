"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, UserPlus, MessageCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { searchPeopleAction, getMyConnectionsAction } from "@/actions/connection.actions";
import { messageClientService as messageService } from "@/services/message.client.service";
import type { Conversation } from "@/types/message.types";
import type { ConnectionOtherUser, ConnectionWithUser } from "@/types/connection.types";

interface NewMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  /**
   * Map of other-participant userId -> conversationId for the current user's
   * existing DIRECT conversations. Used to avoid starting duplicate chats.
   */
  existingConversationByUser: Map<string, string>;
  /** Called with the freshly created/found conversation to open it. */
  onStart: (conversation: Conversation) => void;
  /** Open an existing conversation instead of creating a duplicate. */
  onOpenConversation: (conversationId: string) => void;
}

/**
 * Modal to start a new 1:1 conversation.
 * Defaults to the current user's network (connections that don't already have a
 * conversation), and searches the full directory when a query is entered.
 * People already in a conversation open the existing thread instead of
 * creating a duplicate.
 */
export function NewMessageModal({
  open,
  onOpenChange,
  currentUserId,
  existingConversationByUser,
  onStart,
  onOpenConversation,
}: NewMessageModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ConnectionOtherUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [connections, setConnections] = useState<ConnectionOtherUser[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasQuery = query.trim().length > 0;

  // Load the current user's network whenever the modal opens.
  useEffect(() => {
    if (!open) {
      setConnections([]);
      return;
    }
    let cancelled = false;
    setConnectionsLoading(true);
    getMyConnectionsAction("ALL", 1, 100)
      .then((res) => {
        if (cancelled) return;
        const data = (res.data as { data?: ConnectionWithUser[] } | undefined)?.data ?? [];
        setConnections(data.map((c) => c.otherUser).filter((p) => p.id !== currentUserId));
      })
      .catch(() => {
        if (!cancelled) setConnections([]);
      })
      .finally(() => {
        if (!cancelled) setConnectionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, currentUserId]);

  // Reset transient state when the modal closes.
  useEffect(() => {
    if (open) return;
    setQuery("");
    setResults([]);
    setCreatingId(null);
  }, [open]);

  // Debounced directory search while a query is entered.
  useEffect(() => {
    if (!open || !hasQuery) {
      setResults([]);
      setSearchLoading(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await searchPeopleAction({ query: query.trim(), limit: 20 });
        const data = (res.data as { data?: ConnectionOtherUser[] } | undefined)?.data ?? [];
        setResults(data.filter((p) => p.id !== currentUserId));
      } catch {
        setResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, hasQuery, open, currentUserId]);

  // Connections that don't already have a conversation with the user.
  const availableConnections = useMemo(
    () => connections.filter((p) => !existingConversationByUser.has(p.id)),
    [connections, existingConversationByUser],
  );

  const handleStart = async (person: ConnectionOtherUser) => {
    if (creatingId) return;
    setCreatingId(person.id);
    try {
      const conversation = await messageService.createConversation({
        participantId: person.id,
      });
      toast.success(`Conversation started with ${person.name}`);
      onOpenChange(false);
      onStart(conversation);
    } catch (err) {
      setCreatingId(null);
      toast.error(err instanceof Error ? err.message : "Failed to start conversation.");
    }
  };

  const handleOpenExisting = (person: ConnectionOtherUser) => {
    const conversationId = existingConversationByUser.get(person.id);
    if (!conversationId) return;
    onOpenChange(false);
    onOpenConversation(conversationId);
  };

  const renderPerson = (p: ConnectionOtherUser) => {
    const existingId = existingConversationByUser.get(p.id);
    const isCreating = creatingId === p.id;
    return (
      <li key={p.id}>
        <button
          type="button"
          onClick={() => (existingId ? handleOpenExisting(p) : handleStart(p))}
          disabled={creatingId !== null}
          aria-label={
            existingId
              ? `Open chat with ${p.name}`
              : `Start chat with ${p.name}`
          }
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted",
            creatingId !== null && "cursor-not-allowed opacity-60",
          )}
        >
          <Avatar id={p.id} name={p.name} src={p.image} className="size-9" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{p.name}</p>
            {p.student?.department && (
              <p className="truncate text-xs text-muted-foreground">
                {p.student.department}
              </p>
            )}
          </div>
          {existingId ? (
            <MessageCircle className="size-4 shrink-0 text-muted-foreground" />
          ) : isCreating ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <UserPlus className="size-4 shrink-0 text-muted-foreground" />
          )}
        </button>
      </li>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
          <DialogDescription>
            Start a chat with a connection or search for anyone.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people by name..."
            className="pl-9"
          />
        </div>

        <div className="max-h-72 min-h-24 overflow-y-auto">
          {hasQuery ? (
            searchLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No people found for &quot;{query.trim()}&quot;. Try a different name.
              </p>
            ) : (
              <ul className="space-y-1">
                {results.map((p) => renderPerson(p))}
              </ul>
            )
          ) : connectionsLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : availableConnections.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {connections.length === 0
                ? "You don't have any connections yet. Connect with people to start a chat."
                : "You've already started a chat with all your connections."}
            </p>
          ) : (
            <>
              <p className="px-2 pt-1 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Your connections
              </p>
              <ul className="space-y-1">
                {availableConnections.map((p) => renderPerson(p))}
              </ul>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
