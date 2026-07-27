"use client";

import { useRef, useMemo, useState, useCallback } from "react";
import { ArrowLeft, MoreVertical, Info, Trash2, MessageSquare, Bell, BellOff } from "lucide-react";
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
import { MessageSearch } from "./message-search";
import { ImageLightbox } from "./image-lightbox";
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
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onRetry?: (message: Message) => void;
  onToggleMute?: () => void;
  isMuted?: boolean;
  replyTo?: Message | null;
  onCancelReply?: () => void;
  onSearch?: (query: string) => void;
  searchResultCount?: number;
  searchLoading?: boolean;
  searchQuery?: string;
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
  onReply,
  onForward,
  onEdit,
  onDelete,
  onReaction,
  onRetry,
  onToggleMute,
  isMuted,
  replyTo,
  onCancelReply,
  onSearch,
  searchResultCount = 0,
  searchLoading,
  searchQuery,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lightboxImages, setLightboxImages] = useState<{ url: string; alt?: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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

  const handleImageClick = useCallback((url: string, alt?: string) => {
    // Collect all image messages for lightbox navigation
    const allImages = messages
      .filter((m) => m.type === "IMAGE" && m.fileUrl)
      .map((m) => ({ url: m.fileUrl!, alt: m.fileName ?? "image" }));
    const idx = allImages.findIndex((img) => img.url === url);
    setLightboxImages(allImages.length > 0 ? allImages : [{ url, alt }]);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  }, [messages]);

  const participants = useMemo(
    () =>
      conversation?.conversationParticipants?.map((p) => ({
        id: p.userId,
        name: p.user?.name ?? "User",
        image: p.user?.image,
      })) ?? [],
    [conversation],
  );

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="relative">
          <div className="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5">
            <MessageSquare className="size-12 text-primary/30" />
          </div>
          <div className="absolute -top-2 -right-2 flex size-8 items-center justify-center rounded-full bg-primary/10">
            <span className="text-lg">💬</span>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Welcome to Messages</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Select a conversation from the sidebar to start chatting, or create a new one.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <span className="text-base">👥</span>
            Group chats
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <span className="text-base">📎</span>
            Share files
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <span className="text-base">😊</span>
            Reactions
          </div>
        </div>
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

        {/* Search */}
        {onSearch && (
          <MessageSearch
            onSearch={onSearch}
            resultCount={searchResultCount}
            loading={searchLoading}
            className="hidden sm:flex"
          />
        )}

        {/* Mute toggle */}
        {onToggleMute && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <BellOff className="size-4 text-muted-foreground" /> : <Bell className="size-4" />}
          </Button>
        )}

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
            {onToggleMute && (
              <DropdownMenuItem onClick={onToggleMute}>
                {isMuted ? <Bell className="size-4" /> : <BellOff className="size-4" />}
                {isMuted ? "Unmute" : "Mute"}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => {}}>
              <Trash2 className="size-4" />
              Clear messages
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search results info */}
      {searchQuery && (
        <div className="border-b bg-primary/5 px-4 py-1.5 text-xs text-muted-foreground">
          {searchLoading ? (
            "Searching..."
          ) : (
            <>
              Found <span className="font-medium text-foreground">{searchResultCount}</span> result{searchResultCount !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
            </>
          )}
        </div>
      )}

      {/* Messages with MessageScroller */}
      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <MessageScroller className="flex-1">
            <MessageScrollerViewport ref={scrollRef} onScroll={handleScroll}>
              <MessageScrollerContent className="gap-3 px-4 pb-8">
              {loadingMessages && messages.length === 0 ? (
                <div className="mt-auto space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={cn("flex gap-2", i % 2 === 0 && "flex-row-reverse")}>
                      <Skeleton className="size-8 rounded-full" />
                      <Skeleton className={cn("h-14 rounded-2xl", i % 2 === 0 ? "w-1/2" : "w-2/3")} />
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
                              currentUserId={currentUserId}
                              participants={participants}
                              onReply={onReply}
                              onForward={onForward}
                              onEdit={onEdit}
                              onDelete={onDelete}
                              onReaction={onReaction}
                              onRetry={onRetry}
                              onImageClick={handleImageClick}
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
        replyTo={replyTo}
        onCancelReply={onCancelReply}
        participants={participants}
      />

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
