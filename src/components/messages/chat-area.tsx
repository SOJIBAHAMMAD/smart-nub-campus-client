"use client";

import { useEffect, useRef, useMemo } from "react";
import { ArrowLeft, Search, MoreVertical, Info, Trash2, MessageSquare } from "lucide-react";
import type { Conversation, Message } from "@/types/message.types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller";
import { Marker, MarkerContent } from "@/components/ui/marker";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { OnlineStatus } from "./online-status";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { GroupChatHeader } from "./group-chat-header";
import { TypingIndicator } from "./typing-indicator";
import { getConversationDisplay } from "./conversation-utils";
import { formatDayLabel, isSameDay } from "./time";

interface ChatAreaProps {
  conversation: Conversation | null;
  currentUserId: string;
  messages: Message[];
  loadingMessages: boolean;
  hasMore: boolean;
  onlineUsers: Set<string>;
  typing: { active: boolean; names?: string[] };
  onOpenProfile: () => void;
  onSend: (text: string) => void;
  onSendFile: (file: File) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  onLoadOlder: () => void;
  onBackToList: () => void;
}

export function ChatArea({
  conversation,
  currentUserId,
  messages,
  loadingMessages,
  hasMore,
  onlineUsers,
  typing,
  onOpenProfile,
  onSend,
  onSendFile,
  onTypingStart,
  onTypingStop,
  onLoadOlder,
  onBackToList,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);

  const { name, image, isGroup } = conversation
    ? getConversationDisplay(conversation, currentUserId)
    : { name: "", image: undefined, isGroup: false };

  const otherId = !isGroup && conversation
    ? conversation.conversationParticipants?.find((p) => p.userId !== currentUserId)
        ?.userId
    : undefined;
  const isOnline = otherId ? onlineUsers.has(otherId) : false;

  const groups = useMemo(() => {
    const buckets: { label: string; items: Message[] }[] = [];
    for (const m of messages) {
      const label = formatDayLabel(m.createdAt);
      const last = buckets[buckets.length - 1];
      if (last && last.label === label) last.items.push(m);
      else buckets.push({ label, items: [m] });
    }
    return buckets;
  }, [messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop < 60 && hasMore && !loadingMessages) {
      onLoadOlder();
    }
  };

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
        <MessageSquare className="size-10 opacity-40" />
        <p className="text-sm">Select a conversation to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b bg-background px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBackToList}
          className="shrink-0 md:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="size-5" />
        </Button>

        <button
          type="button"
          onClick={onOpenProfile}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          {isGroup ? (
            <GroupChatHeader
              conversation={conversation}
              onlineUsers={onlineUsers}
              currentUserId={currentUserId}
            />
          ) : (
            <>
              <Avatar id={conversation.id} name={name} src={image} className="size-10 shrink-0" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{name}</p>
                <OnlineStatus online={isOnline} showLabel />
              </div>
            </>
          )}
        </button>

        <Button variant="ghost" size="icon" aria-label="Search in conversation">
          <Search className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" />}
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onOpenProfile}>
              <Info className="size-4" />
              {isGroup ? "Group info" : "Contact info"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => {}}>
              <Trash2 className="size-4" />
              Clear messages
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages with MessageScroller */}
      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <MessageScroller className="flex-1">
            <MessageScrollerViewport ref={scrollRef} onScroll={handleScroll}>
              <MessageScrollerContent className="gap-3 px-4 pb-8">
              {loadingMessages && messages.length === 0 ? (
                <div className="mt-auto space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-2">
                      <Skeleton className="size-8 rounded-full" />
                      <Skeleton className="h-14 w-2/3 rounded-2xl" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex-1" />
                  {hasMore && (
                    <MessageScrollerItem messageId="load-older">
                      <p className="py-2 text-center text-xs text-muted-foreground">
                        Load older messages...
                      </p>
                    </MessageScrollerItem>
                  )}
                  {groups.map((bucket) => (
                    <div key={`day-group-${bucket.label}`} className="flex flex-col gap-2">
                      <MessageScrollerItem messageId={`day-${bucket.label}`}>
                        <Marker variant="separator">
                          <MarkerContent>{bucket.label}</MarkerContent>
                        </Marker>
                      </MessageScrollerItem>
                      {bucket.items.map((m, idx) => {
                        const prev = bucket.items[idx - 1];
                        const showSender =
                          !prev || prev.senderId !== m.senderId || !isSameDay(prev.createdAt, m.createdAt);
                        return (
                          <MessageScrollerItem key={m.id} messageId={m.id}>
                            <MessageBubble
                              message={m}
                              isOwn={m.senderId === currentUserId}
                              showSender={showSender}
                              participants={
                                conversation.conversationParticipants?.map((p) => ({
                                  id: p.userId,
                                  name: p.user?.name ?? "User",
                                  image: p.user?.image,
                                })) ?? []
                              }
                            />
                          </MessageScrollerItem>
                        );
                      })}
                    </div>
                  ))}

                  {typing.active && (
                    <MessageScrollerItem messageId="typing-indicator">
                      <div className="flex items-center gap-2 pl-10 text-xs text-muted-foreground">
                        <TypingIndicator names={typing.names} />
                      </div>
                    </MessageScrollerItem>
                  )}
                </>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>

      {/* Composer */}
      <MessageInput
        onSend={onSend}
        onSendFile={onSendFile}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
      />
    </div>
  );
}
