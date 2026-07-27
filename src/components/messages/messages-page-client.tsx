"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { env } from "@/env";
import ROUTES from "@/constants/routes";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import { messageClientService as messageService } from "@/services/message.client.service";
import type { Conversation, Message } from "@/types/message.types";
import type { Message as SocketMessage } from "@/lib/types/socket-events";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MessagesLayout } from "./messages-layout";
import { ConversationList } from "./conversation-list";
import { ChatArea } from "./chat-area";
import { UserProfilePanel } from "./user-profile-panel";
import { NewMessageModal } from "./new-message-modal";
import { CreateGroupModal } from "./create-group-modal";

interface MessagesPageClientProps {
  currentUserId: string;
  initialConversations: Conversation[];
  initialOnlineUserIds?: string[];
  activeConversationId?: string | null;
}

const PAGE_SIZE = 30;

export function MessagesPageClient({
  currentUserId,
  initialConversations,
  initialOnlineUserIds = [],
  activeConversationId = null,
}: MessagesPageClientProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [messagesPage, setMessagesPage] = useState(1);
  const [profileOpen, setProfileOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [_loadingConvos, setLoadingConvos] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(
    () => new Set(initialOnlineUserIds),
  );
  const [typingByConversation, setTypingByConversation] = useState<
    Record<string, { active: boolean; names?: string[]; ts?: number }>
  >({});

  // Reply state
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchHighlightIndex, setSearchHighlightIndex] = useState(0);

  const socketUrl = env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  const { socket, isConnected: _isConnected, status } = useSocket({ url: socketUrl });

  const typingStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingActiveRef = useRef(false);

  const messagesRef = useRef<Message[]>(messages);
  useEffect(() => { messagesRef.current = messages; });

  const emitRead = useCallback(
    (conversationId: string) => {
      if (!socket) return;
      const lastId =
        messagesRef.current.filter((m) => m.conversationId === conversationId).at(-1)?.id ??
        "";
      socket.emit("messaging:read", { conversationId, messageId: lastId });
    },
    [socket],
  );

  useSocketEvent(socket, "presence:update", (data) => {
    setOnlineUsers((prev) => {
      const next = new Set(prev);
      if (data.status === "online") next.add(data.userId);
      else next.delete(data.userId);
      return next;
    });
  });

  useSocketEvent(socket, "messaging:new", (msg: SocketMessage) => {
    const incoming: Message = {
      id: msg.id ?? `srv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      content: msg.content,
      type: (msg.type === "image"
        ? "IMAGE"
        : msg.type === "file"
          ? "FILE"
          : "TEXT") as Message["type"],
      fileUrl: msg.fileUrl ?? undefined,
      filePublicId: msg.filePublicId ?? undefined,
      fileName: msg.fileName ?? undefined,
      fileSize: msg.fileSize ?? undefined,
      isRead: msg.senderId === currentUserId,
      isDeleted: false,
      isEdited: msg.isEdited ?? false,
      isForwarded: msg.isForwarded ?? false,
      replyToId: msg.replyToId ?? undefined,
      replyTo: msg.replyTo
        ? {
            ...msg.replyTo,
            type: "TEXT" as const,
            isRead: true,
            isDeleted: false,
            isEdited: false,
            isForwarded: false,
            createdAt: msg.createdAt,
            updatedAt: msg.createdAt,
            conversationId: msg.conversationId,
            sender: msg.replyTo.sender,
          }
        : undefined,
      createdAt: msg.createdAt,
      updatedAt: msg.createdAt,
    };

    const isOwn = msg.senderId === currentUserId;
    const isActive = msg.conversationId === activeConversationId;

    setConversations((prev) =>
      prev
        .map((c) =>
          c.id === msg.conversationId
            ? {
                ...c,
                lastMessage: incoming,
                lastMessageAt: msg.createdAt,
                unreadCount:
                  isOwn || isActive
                    ? 0
                    : (c.unreadCount ?? 0) + 1,
              }
            : c,
        )
        .sort(
          (a, b) =>
            new Date(b.lastMessageAt ?? 0).getTime() -
            new Date(a.lastMessageAt ?? 0).getTime(),
        ),
    );

    if (isActive) {
      setMessages((prev) => {
        if (isOwn) {
          // For file/image messages, match by fileName since content is the filename
          const isFileMsg = msg.type === "file" || msg.type === "image";
          let idx = prev.findIndex(
            (m) => typeof m.id === "string" && m.id.startsWith("temp-") && m.content === msg.content,
          );
          if (idx === -1 && isFileMsg) {
            idx = prev.findIndex(
              (m) =>
                typeof m.id === "string" &&
                m.id.startsWith("temp-") &&
                m.fileName === msg.fileName,
            );
          }
          if (idx === -1) {
            idx = prev.findIndex(
              (m) => typeof m.id === "string" && m.id.startsWith("temp-"),
            );
          }
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = incoming;
            return dedupe(next);
          }
          return dedupe(prev.concat(incoming));
        }
        return dedupe(prev.concat(incoming));
      });

      if (!isOwn) {
        emitRead(msg.conversationId);
      }
    }
  });

  useSocketEvent(socket, "messaging:read-receipt", (receipt) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === receipt.messageId ? { ...m, isRead: true, readAt: receipt.readAt } : m,
      ),
    );
  });

  useSocketEvent(socket, "error:message", (data) => {
    // Mark any stuck "sending" messages as failed
    setMessages((prev) => {
      const hasSending = prev.some((m) => m.status === "sending");
      if (!hasSending) return prev;
      return prev.map((m) =>
        m.status === "sending" ? { ...m, status: "failed" as const } : m,
      );
    });
    if (data.message) {
      toast.error(data.message);
    }
  });

  useSocketEvent(socket, "typing:update", (data) => {
    if (data.userId === currentUserId) return;
    setTypingByConversation((prev) => {
      const cur = prev[data.conversationId] ?? { active: false };
      return {
        ...prev,
        [data.conversationId]: {
          active: data.isTyping,
          names: data.isTyping ? [data.userId] : undefined,
          ts: data.isTyping ? Date.now() : cur.ts,
        },
      };
    });
    if (data.isTyping) {
      setTimeout(() => {
        setTypingByConversation((prev) => {
          const cur = prev[data.conversationId];
          if (cur && cur.active && Date.now() - (cur.ts ?? 0) >= 4500) {
            return { ...prev, [data.conversationId]: { active: false } };
          }
          return prev;
        });
      }, 5000);
    }
  });

  const refreshConversations = useCallback(async () => {
    setLoadingConvos(true);
    try {
      const res = await messageService.listConversations({ limit: 50 });
      setConversations(res.conversations ?? []);
    } catch {
      /* keep current */
    } finally {
      setLoadingConvos(false);
    }
  }, []);

  useEffect(() => {
    if (status === "connected") {
      void refreshConversations();
      if (activeConversationId) {
        socket?.emit("conversation:join", { conversationId: activeConversationId });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const loadMessages = useCallback(
    async (conversationId: string, page = 1) => {
      setLoadingMessages(true);
      try {
        const res = await messageService.listMessages({
          conversationId,
          limit: PAGE_SIZE,
          page,
        });
        const fetched = [...(res.messages ?? [])].reverse();
        setMessages((prev) => {
          if (page === 1) return dedupe(fetched);
          return dedupe(fetched.concat(prev));
        });
        setMessagesPage(page);
        setHasMore(page < (res.meta?.totalPages ?? 1));
        if (page === 1) {
          void messageService.markAsRead(conversationId).catch(() => {});
          setConversations((prev) =>
            prev.map((c) =>
              c.id === conversationId ? { ...c, unreadCount: 0 } : c,
            ),
          );
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load messages.");
      } finally {
        setLoadingMessages(false);
      }
    },
    [],
  );

  const selectConversation = useCallback(
    (id: string) => {
      router.push(ROUTES.CONVERSATION(id));
    },
    [router],
  );

  // Load messages when activeConversationId prop changes (from Next.js route)
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      setHasMore(false);
      setMessagesPage(1);
      return;
    }
    setMessages([]);
    setHasMore(false);
    setMessagesPage(1);
    setReplyTo(null);
    setSearchQuery("");
    setSearchResults([]);
    void loadMessages(activeConversationId).then(() => emitRead(activeConversationId));
    if (!conversations.some((x) => x.id === activeConversationId)) {
      void refreshConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  useEffect(() => {
    if (!socket || !activeConversationId) return;
      socket.emit("conversation:join", { conversationId: activeConversationId });
      return () => {
        socket.emit("conversation:leave", { conversationId: activeConversationId });
    };
  }, [socket, activeConversationId]);

  const sendText = useCallback(
    async (text: string) => {
      if (!activeConversationId) return;
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimistic: Message = {
        id: tempId,
        conversationId: activeConversationId,
        senderId: currentUserId,
        content: text,
        type: "TEXT",
        isRead: false,
        isDeleted: false,
        isEdited: false,
        isForwarded: false,
        status: "sending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replyToId: replyTo?.id,
        replyTo: replyTo ?? undefined,
      };
      setMessages((prev) => dedupe(prev.concat(optimistic)));
      setReplyTo(null);

      socket?.emit("messaging:send", {
        conversationId: activeConversationId,
        content: text,
        type: "text",
        replyToId: replyTo?.id,
      });
    },
    [activeConversationId, currentUserId, socket, replyTo],
  );

  const sendFile = useCallback(
    async (file: File) => {
      if (!activeConversationId || !socket) return;
      const isImage = file.type.startsWith("image/");
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimistic: Message = {
        id: tempId,
        conversationId: activeConversationId,
        senderId: currentUserId,
        content: file.name,
        type: isImage ? "IMAGE" : "FILE",
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: file.size,
        isRead: false,
        isDeleted: false,
        isEdited: false,
        isForwarded: false,
        status: "sending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMessages((prev) => dedupe(prev.concat(optimistic)));

      try {
        const { uploadService } = await import("@/services/upload.service");
        const uploaded = await uploadService.upload(
          file,
          "messages",
          isImage ? "image" : "raw",
        );
        socket.emit("messaging:send", {
          conversationId: activeConversationId,
          content: file.name,
          type: isImage ? "image" : "file",
          fileUrl: uploaded.url,
          filePublicId: uploaded.publicId,
          fileName: file.name,
          fileSize: file.size,
        });
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, status: "failed" } : m,
          ),
        );
        toast.error(err instanceof Error ? err.message : "Failed to send file.");
      }
    },
    [activeConversationId, currentUserId, socket],
  );

  const handleReply = useCallback((message: Message) => {
    setReplyTo(message);
  }, []);

  const handleForward = useCallback((message: Message) => {
    // Forward: pick target conversation then send
    toast.info(`Forward "${message.content.slice(0, 30)}${message.content.length > 30 ? "..." : ""}" — select a conversation`);
    // For now, open new message modal with forwarded state
    setNewOpen(true);
  }, []);

  const handleEdit = useCallback(async (message: Message) => {
    if (!activeConversationId) return;
    const newContent = window.prompt("Edit message:", message.content);
    if (!newContent || newContent === message.content) return;
    try {
      const updated = await messageService.editMessage(activeConversationId, message.id, newContent);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id ? { ...m, content: updated.content, isEdited: true, editedAt: updated.editedAt } : m,
        ),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to edit message.");
    }
  }, [activeConversationId]);

  const handleDelete = useCallback(async (message: Message) => {
    if (!activeConversationId) return;
    if (!confirm("Delete this message?")) return;
    try {
      await messageService.deleteMessage(activeConversationId, message.id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id ? { ...m, content: "This message was deleted.", isDeleted: true } : m,
        ),
      );
      toast.success("Message deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete message.");
    }
  }, [activeConversationId]);

  const handleReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!activeConversationId) return;
    try {
      const reaction = await messageService.addReaction(activeConversationId, messageId, emoji);
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const existing = m.reactions ?? [];
          // Remove any prior reaction by this user on this message
          const filtered = existing.filter((r) => r.userId !== reaction.userId);
          // If server returned a reaction with matching emoji, it was a replacement — add it
          // If same emoji was toggled off, server returns the deleted reaction; detect by checking
          // if the returned emoji matches the user's prior reaction (now removed) → skip re-adding
          const hadSameEmoji = existing.some(
            (r) => r.userId === reaction.userId && r.emoji === reaction.emoji,
          );
          if (hadSameEmoji) {
            // Same emoji toggled off — don't re-add
            return { ...m, reactions: filtered };
          }
          // Different emoji or new reaction — add it
          return { ...m, reactions: [...filtered, reaction] };
        }),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add reaction.");
    }
  }, [activeConversationId]);

  const handleToggleMute = useCallback(async () => {
    if (!activeConversationId) return;
    const convo = conversations.find((c) => c.id === activeConversationId);
    if (!convo) return;
    const me = convo.conversationParticipants?.find((p) => p.userId === currentUserId);
    const newMuted = !(me?.isMuted ?? false);
    try {
      await messageService.updateConversationSettings(activeConversationId, { isMuted: newMuted });
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConversationId) return c;
          return {
            ...c,
            conversationParticipants: c.conversationParticipants?.map((p) =>
              p.userId === currentUserId ? { ...p, isMuted: newMuted } : p,
            ),
          };
        }),
      );
      toast.success(newMuted ? "Conversation muted" : "Conversation unmuted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update settings.");
    }
  }, [activeConversationId, conversations, currentUserId]);

  const handleTogglePin = useCallback(async (pinned: boolean) => {
    if (!activeConversationId) return;
    try {
      await messageService.updateConversationSettings(activeConversationId, { isPinned: pinned });
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConversationId) return c;
          return {
            ...c,
            conversationParticipants: c.conversationParticipants?.map((p) =>
              p.userId === currentUserId ? { ...p, isPinned: pinned } : p,
            ),
          };
        }),
      );
      toast.success(pinned ? "Conversation pinned" : "Conversation unpinned");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update settings.");
    }
  }, [activeConversationId, currentUserId]);

  const handleRetry = useCallback(async (message: Message) => {
    if (!activeConversationId || !socket) return;
    // Mark as sending
    setMessages((prev) =>
      prev.map((m) =>
        m.id === message.id ? { ...m, status: "sending" as const } : m,
      ),
    );
    try {
      if (message.type === "FILE" || message.type === "IMAGE") {
        // For files, re-upload would be complex — just mark as failed and toast
        toast.error("File retry not supported. Please resend the file.");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === message.id ? { ...m, status: "failed" as const } : m,
          ),
        );
        return;
      }
      // Resend text via socket
      socket.emit("messaging:send", {
        conversationId: activeConversationId,
        content: message.content,
        type: "text",
        replyToId: message.replyToId,
      });
      // The messaging:new handler will replace the temp message
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id ? { ...m, status: "failed" as const } : m,
        ),
      );
      toast.error("Failed to resend message.");
    }
  }, [activeConversationId, socket]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query || !activeConversationId) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await messageService.listMessages({
        conversationId: activeConversationId,
        search: query,
        limit: 50,
      });
      setSearchResults(res.messages ?? []);
      setSearchHighlightIndex(0);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [activeConversationId]);

  const handleSearchNext = useCallback(() => {
    setSearchHighlightIndex((prev) => (prev + 1) % searchResults.length);
  }, [searchResults.length]);

  const handleSearchPrev = useCallback(() => {
    setSearchHighlightIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
  }, [searchResults.length]);

  const emitTypingStart = useCallback(() => {
    if (!activeConversationId || !socket) return;
    if (!typingActiveRef.current) {
      typingActiveRef.current = true;
      socket.emit("typing:start", { conversationId: activeConversationId });
    }
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
    typingStopTimer.current = setTimeout(() => {
      typingActiveRef.current = false;
      socket.emit("typing:stop", { conversationId: activeConversationId });
    }, 3000);
  }, [activeConversationId, socket]);

  const emitTypingStop = useCallback(() => {
    if (!activeConversationId || !socket || !typingActiveRef.current) return;
    typingActiveRef.current = false;
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
    socket.emit("typing:stop", { conversationId: activeConversationId });
  }, [activeConversationId, socket]);

  const loadOlder = useCallback(() => {
    if (!activeConversationId || loadingMessages || !hasMore) return;
    void loadMessages(activeConversationId, messagesPage + 1);
  }, [activeConversationId, loadingMessages, hasMore, messagesPage, loadMessages]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );

  const sharedFiles = useMemo(
    () =>
      messages.filter(
        (m) => m.type === "FILE" || m.type === "IMAGE",
      ),
    [messages],
  );

  const activeTyping = activeConversationId
    ? typingByConversation[activeConversationId] ?? { active: false }
    : { active: false };

  const isMobile = useMediaQuery("(max-width: 767px)");
  const _isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");

  const activeConvoMuted = useMemo(() => {
    if (!activeConversation) return false;
    const me = activeConversation.conversationParticipants?.find((p) => p.userId === currentUserId);
    return me?.isMuted ?? false;
  }, [activeConversation, currentUserId]);

  const profilePanelContent = activeConversation && (
    <UserProfilePanel
      conversation={activeConversation}
      currentUserId={currentUserId}
      onlineUsers={onlineUsers}
      sharedFiles={sharedFiles}
      onClose={() => setProfileOpen(false)}
      onTogglePin={handleTogglePin}
      onToggleMute={handleToggleMute}
    />
  );

  return (
    <>
      {/* Connection status - toast-like pill at top */}
      {status !== "connected" && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 rounded-full border bg-background/95 px-4 py-2 shadow-lg backdrop-blur-sm">
            {status === "connecting" ? (
              <>
                <Loader2 className="size-3.5 animate-spin text-amber-500" />
                <span className="text-xs font-medium text-amber-600">Connecting...</span>
              </>
            ) : (
              <>
                <WifiOff className="size-3.5 text-red-500" />
                <span className="text-xs font-medium text-red-600">Disconnected</span>
                <span className="text-[10px] text-muted-foreground">Reconnecting...</span>
              </>
            )}
          </div>
        </div>
      )}

      <MessagesLayout
        activeConversationId={activeConversationId}
        conversationList={
          <ConversationList
            conversations={conversations}
            currentUserId={currentUserId}
            activeConversationId={activeConversationId}
            onlineUsers={onlineUsers}
            typingByConversation={typingByConversation}
            onSelect={selectConversation}
            onNewMessage={() => setNewOpen(true)}
            onNewGroup={() => setCreateGroupOpen(true)}
          />
        }
        chat={
          <ChatArea
            conversation={activeConversation}
            currentUserId={currentUserId}
            messages={messages}
            loadingMessages={loadingMessages}
            hasMore={hasMore}
            onlineUsers={onlineUsers}
            typing={activeTyping}
            onOpenProfile={() => setProfileOpen(true)}
            onSend={sendText}
            onSendFile={sendFile}
            onTypingStart={emitTypingStart}
            onTypingStop={emitTypingStop}
            onLoadOlder={loadOlder}
            onBackToList={() => {
              router.push(ROUTES.MESSAGES);
            }}
            onReply={handleReply}
            onForward={handleForward}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReaction={handleReaction}
            onRetry={handleRetry}
            onToggleMute={handleToggleMute}
            isMuted={activeConvoMuted}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onSearch={handleSearch}
            searchResultCount={searchResults.length}
            searchLoading={searchLoading}
            searchQuery={searchQuery}
            onSearchNext={handleSearchNext}
            onSearchPrev={handleSearchPrev}
            searchHighlightIndex={searchHighlightIndex}
            searchResultIds={searchResults.map((r) => r.id)}
          />
        }
        profilePanel={!isMobile && profileOpen ? profilePanelContent : undefined}
      />

      {/* Mobile: Sheet overlay for profile */}
      {isMobile && (
        <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
          <SheetContent side="right" className="w-72 p-0 sm:max-w-72">
            {profilePanelContent}
          </SheetContent>
        </Sheet>
      )}

      <NewMessageModal
        open={newOpen}
        onOpenChange={setNewOpen}
        currentUserId={currentUserId}
        onStart={(c) => {
          setConversations((prev) =>
            prev.some((x) => x.id === c.id) ? prev : [c, ...prev],
          );
          selectConversation(c.id);
        }}
      />

      <CreateGroupModal
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        currentUserId={currentUserId}
        createGroup={(data) => messageService.createGroup(data)}
        onCreated={(c) => {
          const conv = c as Conversation;
          setConversations((prev) =>
            prev.some((x) => x.id === conv.id) ? prev : [conv, ...prev],
          );
          selectConversation(conv.id);
        }}
      />
    </>
  );
}

function dedupe(list: Message[]): Message[] {
  const seen = new Set<string>();
  const out: Message[] = [];
  for (const m of list) {
    const id = m.id ?? `gen-${Math.random().toString(36).slice(2, 9)}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(m.id === id ? m : { ...m, id });
  }
  return out.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}
