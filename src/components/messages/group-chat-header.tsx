import { Avatar } from "@/components/ui/avatar";
import type { Conversation } from "@/types/message.types";
import { cn } from "@/lib/utils";

interface GroupChatHeaderProps {
  conversation: Conversation;
  onlineUsers: Set<string>;
  currentUserId: string;
  className?: string;
}

/**
 * Header shown for GROUP conversations: group image, name, member count,
 * and a row of member avatars with online presence dots.
 */
export function GroupChatHeader({
  conversation,
  onlineUsers,
  currentUserId,
  className,
}: GroupChatHeaderProps) {
  const members =
    conversation.conversationParticipants?.filter((p) => p.userId !== currentUserId) ?? [];
  const onlineCount = members.filter((m) => m.user && onlineUsers.has(m.user.id)).length;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Avatar
        id={conversation.id}
        name={conversation.name ?? "Group"}
        src={conversation.groupImage}
        className="size-10"
      />
      <div className="min-w-0">
        <p className="truncate font-semibold text-foreground">
          {conversation.name ?? "Group"}
        </p>
        <p className="text-xs text-muted-foreground">
          {members.length + 1} members
          {onlineCount > 0 && (
            <span className="text-emerald-600"> · {onlineCount} online</span>
          )}
        </p>
      </div>

      <div className="ml-2 hidden -space-x-2 sm:flex">
        {members.slice(0, 5).map((m) => (
          <div key={m.id} className="relative">
            <Avatar
              id={m.userId}
              name={m.user?.name ?? "?"}
              src={m.user?.image}
              className="size-7 ring-2 ring-background"
            />
            {m.user && onlineUsers.has(m.user.id) && (
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
            )}
          </div>
        ))}
        {members.length > 5 && (
          <span className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-background">
            +{members.length - 5}
          </span>
        )}
      </div>
    </div>
  );
}
