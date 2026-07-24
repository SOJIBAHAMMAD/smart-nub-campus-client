import { Avatar } from "@/components/ui/avatar";
import type { Conversation } from "@/types/message.types";
import { cn } from "@/lib/utils";
import { OnlineStatus } from "./online-status";
import { UnreadBadge } from "./unread-badge";
import { TypingIndicator } from "./typing-indicator";
import { getConversationDisplay, getPreviewText } from "./conversation-utils";
import { formatRelativeShort } from "./time";

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  /** Whether this conversation is the currently active one. */
  active: boolean;
  /** IDs of users currently online (for the presence dot). */
  onlineUsers: Set<string>;
  /** Whether someone is typing in this conversation (excluding current user). */
  typing: boolean;
  /** Typing display names. */
  typingNames?: string[];
  onSelect: (id: string) => void;
}

/**
 * A single row in the conversation list (Column 2). Shows avatar, name,
 * last-message preview, relative timestamp, unread badge, and online dot.
 */
export function ConversationItem({
  conversation,
  currentUserId,
  active,
  onlineUsers,
  typing,
  typingNames,
  onSelect,
}: ConversationItemProps) {
  const { name, image, isGroup } = getConversationDisplay(conversation, currentUserId);

  // For direct chats, use the other participant's id for the presence dot.
  const otherId = !isGroup
    ? conversation.conversationParticipants?.find((p) => p.userId !== currentUserId)
        ?.userId
    : undefined;
  const isOnline = otherId ? onlineUsers.has(otherId) : false;

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition-colors",
        active
          ? "bg-primary/10 ring-1 ring-primary/20"
          : "hover:bg-muted",
      )}
    >
      <div className="relative shrink-0">
        <Avatar id={conversation.id} name={name} src={image} className="size-11" />
        {!isGroup && (
          <span className="absolute -bottom-0.5 -right-0.5">
            <OnlineStatus online={isOnline} className="size-3" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {name}
          </span>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {conversation.lastMessageAt
              ? formatRelativeShort(conversation.lastMessageAt)
              : ""}
          </span>
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="truncate text-xs text-muted-foreground">
            {typing ? (
              <TypingIndicator names={typingNames} />
            ) : (
              getPreviewText(conversation)
            )}
          </span>
          <UnreadBadge count={conversation.unreadCount ?? 0} />
        </div>
      </div>
    </button>
  );
}
