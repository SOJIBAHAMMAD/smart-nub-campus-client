"use client";

import { X, FileText } from "lucide-react";
import type { Conversation, Message } from "@/types/message.types";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { SharedFiles } from "./shared-files";
import { OnlineStatus } from "./online-status";
import { getConversationDisplay } from "./conversation-utils";
import { cn } from "@/lib/utils";

interface UserProfilePanelProps {
  conversation: Conversation | null;
  currentUserId: string;
  onlineUsers: Set<string>;
  sharedFiles: Message[];
  onClose: () => void;
  className?: string;
}

export function UserProfilePanel({
  conversation,
  currentUserId,
  onlineUsers,
  sharedFiles,
  onClose,
  className,
}: UserProfilePanelProps) {
  if (!conversation) return null;

  const { name, image, isGroup } = getConversationDisplay(conversation, currentUserId);

  if (isGroup) {
    const members = conversation.conversationParticipants ?? [];
    return (
      <div className={cn("flex h-full flex-col", className)}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-bold">Group info</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <Avatar id={conversation.id} name={name} src={image} className="size-16" />
            <p className="font-semibold text-foreground">{name}</p>
            {conversation.description && (
              <p className="text-xs text-muted-foreground">{conversation.description}</p>
            )}
          </div>
          <Separator />
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Members ({members.length})
            </h4>
            <ul className="space-y-2">
              {members.map((m) => (
                <li key={m.id} className="flex items-center gap-2">
                  <div className="relative">
                    <Avatar id={m.userId} name={m.user?.name ?? "?"} src={m.user?.image} className="size-8" />
                    {m.user && onlineUsers.has(m.user.id) && (
                      <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                    )}
                  </div>
                  <span className="flex-1 truncate text-sm">
                    {m.user?.name ?? "Unknown"}
                    {m.userId === currentUserId && (
                      <span className="ml-1 text-xs text-muted-foreground">(You)</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <Separator />
          <SharedFilesSection files={sharedFiles} />
        </div>
      </div>
    );
  }

  const other = conversation.conversationParticipants?.find(
    (p) => p.userId !== currentUserId,
  );
  const otherId = other?.userId;
  const isOnline = otherId ? onlineUsers.has(otherId) : false;

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-base font-bold">Contact info</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="size-4" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <Avatar id={otherId ?? conversation.id} name={name} src={image} className="size-16" />
          <p className="font-semibold text-foreground">{name}</p>
          <OnlineStatus online={isOnline} showLabel />
        </div>
        <Separator />
        <SharedFilesSection files={sharedFiles} />
      </div>
    </div>
  );
}

function SharedFilesSection({ files }: { files: Message[] }) {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <FileText className="size-3.5" /> Shared Files
      </h4>
      <SharedFiles files={files} />
    </div>
  );
}
