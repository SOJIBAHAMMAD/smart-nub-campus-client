import type { Conversation } from "@/types/message.types";

/**
 * Derives the display name + avatar for a conversation from the current
 * user's perspective. Direct conversations show the *other* participant;
 * group conversations show the group name + image.
 */
export function getConversationDisplay(
  conversation: Conversation,
  currentUserId: string,
): { name: string; image?: string | null; isGroup: boolean } {
  const isGroup = conversation.type === "GROUP";
  if (isGroup) {
    return {
      name: conversation.name ?? "Group",
      image: conversation.groupImage,
      isGroup: true,
    };
  }

  const other =
    conversation.conversationParticipants?.find((p) => p.userId !== currentUserId)
      ?.user ?? conversation.lastMessage?.sender;

  return {
    name: other?.name ?? "Unknown",
    image: other?.image,
    isGroup: false,
  };
}

/** Last message preview text (trims and handles attachments). */
export function getPreviewText(conversation: Conversation): string {
  const last = conversation.lastMessage;
  if (!last) return "No messages yet";
  if (last.type === "IMAGE") return "📷 Photo";
  if (last.type === "FILE") return `📎 ${last.fileName ?? "File"}`;
  return last.content;
}
