"use client";

import { useRef, useMemo, useState, useCallback, useEffect } from "react";
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
  useMessageScroller,
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

function SearchScroller({
  searchQuery,
  searchResultIds,
  searchHighlightIndex,
}: {
  searchQuery?: string;
  searchResultIds: string[];
  searchHighlightIndex: number;
}) {
  const { scrollToMessage } = useMessageScroller();

  useEffect(() => {
    if (!searchQuery || searchResultIds.length === 0) return;
    const activeId = searchResultIds[searchHighlightIndex];
    if (!activeId) return;
    scrollToMessage(activeId, { align: "center", behavior: "smooth" });
    const el = document.getElementById(`msg-${activeId}`);
    if (el) {
      el.classList.add("search-flash");
      const timer = setTimeout(() => el.classList.remove("search-flash"), 1500);
      return () => clearTimeout(timer);
    }
  }, [searchHighlightIndex, searchQuery, searchResultIds, scrollToMessage]);

  return null;
}

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
  onSearchNext?: () => void;
  onSearchPrev?: () => void;
  searchHighlightIndex?: number;
  searchResultIds?: string[];
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
  onSearchNext,
  onSearchPrev,
  searchHighlightIndex = 0,
  searchResultIds = [],
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lightboxImages, setLightboxImages] = useState<{ url: string; alt?: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { name, image, isGroup } = conversation
    ? getConversationDisplay(conversation, currentUserId)
    : { name: "", image: undefined, isGroup: false };

  const otherId =
    !isGroup && conversation
      ? conversation.conversationParticipants?.find((p) => p.userId !== currentUserId)?.userId
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

  // Map: message ID → index of its first match in the global match list
  const messageMatchMap = useMemo(() => {
    if (!searchQuery || searchResultIds.length === 0) return new Map<string, number>();
    const map = new Map<string, number>();
    let runningIndex = 0;
    const lowerQuery = searchQuery.toLowerCase();
    for (const id of searchResultIds) {
      map.set(id, runningIndex);
      const msg = messages.find((m) => m.id === id);
      if (msg?.content) {
        const matches = msg.content.toLowerCase().split(lowerQuery).length - 1;
        runningIndex += Math.max(matches, 1);
      } else {
        runningIndex += 1;
      }
    }
    return map;
  }, [searchQuery, searchResultIds, messages]);

  // Total number of individual text matches across all result messages
  const totalMatchCount = useMemo(() => {
    if (!searchQuery || searchResultIds.length === 0) return 0;
    const lowerQuery = searchQuery.toLowerCase();
    let total = 0;
    for (const id of searchResultIds) {
      const msg = messages.find((m) => m.id === id);
      if (msg?.content) {
        total += Math.max(msg.content.toLowerCase().split(lowerQuery).length - 1, 1);
      } else {
        total += 1;
      }
    }
    return total;
  }, [searchQuery, searchResultIds, messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop < 60 && hasMore && !loadingMessages) {
      onLoadOlder();
    }
  };

  const handleImageClick = useCallback(
    (url: string, alt?: string) => {
      const allImages = messages
        .filter((m) => m.type === "IMAGE" && m.fileUrl)
        .map((m) => ({ url: m.fileUrl!, alt: m.fileName ?? "image" }));
      const idx = allImages.findIndex((img) => img.url === url);
      setLightboxImages(allImages.length > 0 ? allImages : [{ url, alt }]);
      setLightboxIndex(idx >= 0 ? idx : 0);
      setLightboxOpen(true);
    },
    [messages],
  );

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
            <span className="text-lg" aria-hidden="true">
              💬
            </span>
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
            <span className="text-base" aria-hidden="true">
              👥
            </span>
            Group chats
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <span className="text-base" aria-hidden="true">
              📎
            </span>
            Share files
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <span className="text-base" aria-hidden="true">
              😊
            </span>
            Reactions
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <header
        className="flex items-center gap-2 border-b bg-background px-4 py-2.5"
        role="banner"
      >
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
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 text-left transition-colors hover:bg-muted/50",
            searchOpen && "hidden sm:flex",
          )}
          aria-label={`Open ${isGroup ? "group" : "contact"} info for ${name}`}
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
            onOpenChange={setSearchOpen}
            onNavigateNext={onSearchNext}
            onNavigatePrev={onSearchPrev}
            currentIndex={searchResultCount > 0 ? searchHighlightIndex + 1 : 0}
          />
        )}

        {/* Mute toggle — handled in 3-dot dropdown */}

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
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
      </header>

      {/* Search results info */}
      {searchQuery && (
        <div
          className="border-b bg-primary/5 px-4 py-1.5 text-xs text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {searchLoading ? (
            "Searching..."
          ) : (
            <>
              Found{" "}
              <span className="font-medium text-foreground">{searchResultCount}</span>{" "}
              result{searchResultCount !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
            </>
          )}
        </div>
      )}

      {/* Messages with MessageScroller */}
      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <SearchScroller
          searchQuery={searchQuery}
          searchResultIds={searchResultIds}
          searchHighlightIndex={searchHighlightIndex}
        />
        <MessageScroller className="flex-1">
          <MessageScrollerViewport
            ref={scrollRef}
            onScroll={handleScroll}
            role="log"
            aria-label="Messages"
            aria-live="polite"
            aria-atomic="false"
          >
            <MessageScrollerContent className="gap-1 px-4 pb-8 pt-4">
              {loadingMessages && messages.length === 0 ? (
                <div className="mt-auto space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn("flex gap-2", i % 2 === 0 && "flex-row-reverse")}
                    >
                      <Skeleton className="size-8 rounded-full" />
                      <Skeleton
                        className={cn(
                          "h-12 rounded-2xl",
                          i % 2 === 0 ? "w-1/2 rounded-br-sm" : "w-2/3 rounded-bl-sm",
                        )}
                      />
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
                    <div key={`day-group-${bucket.label}`} className="flex flex-col">
                      <MessageScrollerItem messageId={`day-${bucket.label}`}>
                        <Marker variant="separator">
                          <MarkerContent>{bucket.label}</MarkerContent>
                        </Marker>
                      </MessageScrollerItem>
                      {bucket.items.map((m, idx) => {
                        const prev = bucket.items[idx - 1];
                        const next = bucket.items[idx + 1];
                        const showSender =
                          !prev ||
                          prev.senderId !== m.senderId ||
                          !isSameDay(prev.createdAt, m.createdAt);
                        // Reduce gap between consecutive messages from same sender
                        const isConsecutive =
                          prev &&
                          prev.senderId === m.senderId &&
                          isSameDay(prev.createdAt, m.createdAt);
                        // Show tail on last message of a group
                        const isLastInGroup =
                          !next ||
                          next.senderId !== m.senderId ||
                          !isSameDay(m.createdAt, next.createdAt);

                        return (
                          <MessageScrollerItem key={m.id} messageId={m.id}>
                            <div
                              id={`msg-${m.id}`}
                              className={cn(
                                "flex",
                                isConsecutive ? "mt-0.5" : "mt-2.5",
                                isLastInGroup && "mb-1",
                              )}
                            >
                              <MessageBubble
                                message={m}
                                isOwn={m.senderId === currentUserId}
                                showSender={showSender}
                                currentUserId={currentUserId}
                                participants={participants}
                                searchHighlight={
                                  searchQuery && searchResultIds.includes(m.id)
                                    ? {
                                        query: searchQuery,
                                        activeMatchGlobalIndex: searchHighlightIndex,
                                        firstMatchIndexInMessage: messageMatchMap.get(m.id) ?? 0,
                                      }
                                    : null
                                }
                                onReply={onReply}
                                onForward={onForward}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onReaction={onReaction}
                                onRetry={onRetry}
                                onImageClick={handleImageClick}
                              />
                            </div>
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
