"use client";

import { useMemo, useState } from "react";
import { Forward, Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { messageClientService as messageService } from "@/services/message.client.service";
import type { Conversation, Message } from "@/types/message.types";

interface ForwardMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: Conversation[];
  currentUserId: string;
  /** Conversation the forwarded message currently lives in (excluded as a target). */
  sourceConversationId: string | null;
  /** The message being forwarded. */
  message: Message | null;
  /** Called after a successful forward. */
  onForwarded?: () => void;
}

function conversationTitle(c: Conversation, currentUserId: string): string {
  if (c.name) return c.name;
  const peer = c.conversationParticipants?.find((p) => p.userId !== currentUserId);
  return peer?.user?.name ?? "Conversation";
}

/**
 * Lets the user pick a target conversation to forward a message to. Forwarding
 * posts a copy to the target thread while staying in the current conversation.
 */
export function ForwardMessageModal({
  open,
  onOpenChange,
  conversations,
  currentUserId,
  sourceConversationId,
  message,
  onForwarded,
}: ForwardMessageModalProps) {
  const [query, setQuery] = useState("");
  const [forwardingId, setForwardingId] = useState<string | null>(null);

  const targets = useMemo(() => {
    const filtered = conversations.filter((c) => c.id !== sourceConversationId);
    const q = query.trim().toLowerCase();
    if (!q) return filtered;
    return filtered.filter((c) =>
      conversationTitle(c, currentUserId).toLowerCase().includes(q),
    );
  }, [conversations, query, sourceConversationId, currentUserId]);

  const handleForward = async (target: Conversation) => {
    if (!message || !sourceConversationId) return;
    setForwardingId(target.id);
    try {
      await messageService.forwardMessage(
        sourceConversationId,
        target.id,
        message.id,
      );
      toast.success(`Forwarded to ${conversationTitle(target, currentUserId)}`);
      setQuery("");
      onOpenChange(false);
      onForwarded?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to forward message.");
    } finally {
      setForwardingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Forward message</DialogTitle>
          <DialogDescription>
            {message
              ? `Choose a conversation to forward "${message.content.slice(0, 60)}${message.content.length > 60 ? "…" : ""}" to.`
              : "Choose a conversation to forward this message to."}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9"
          />
        </div>

        <div className="max-h-72 min-h-24 overflow-y-auto">
          {targets.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {query ? "No matching conversations." : "No other conversations yet."}
            </p>
          ) : (
            <ul className="space-y-1">
              {targets.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    disabled={forwardingId !== null}
                    onClick={() => void handleForward(c)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted disabled:opacity-60",
                    )}
                  >
                    <Avatar id={c.id} name={conversationTitle(c, currentUserId)} src={c.groupImage} className="size-9" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {conversationTitle(c, currentUserId)}
                      </p>
                      {c.type === "GROUP" && (
                        <p className="truncate text-xs text-muted-foreground">
                          {c.conversationParticipants?.length ?? 0} members
                        </p>
                      )}
                    </div>
                    {forwardingId === c.id ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Forward className="size-4 text-muted-foreground" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
