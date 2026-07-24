"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { env } from "@/env";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import { messageClientService as messageService } from "@/services/message.client.service";
import type { Conversation, Message, ConversationType } from "@/types/message.types";
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
}

const PAGE_SIZE = 30;

export function MessagesPageClient({
  currentUserId,
  initialConversations,
  initialOnlineUserIds = [],
}: MessagesPageClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
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

  const searchParams = useSearchParams();

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
      isRead: msg.senderId === currentUserId,
      isDeleted: false,
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
          let idx = prev.findIndex(
            (m) => typeof m.id === "string" && m.id.startsWith("temp-") && m.content === msg.content,
          );
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
      setActiveConversationId(id);
      setMessages([]);
      setHasMore(false);
      setMessagesPage(1);
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set("c", id);
      window.history.replaceState(null, "", `?${params.toString()}`);
      void loadMessages(id).then(() => emitRead(id));
    },
    [loadMessages, searchParams, emitRead],
  );

  useEffect(() => {
    const c = searchParams.get("c");
    if (!c) return;
    setActiveConversationId(c);
    setMessages([]);
    setHasMore(false);
    setMessagesPage(1);
    void loadMessages(c).then(() => emitRead(c));
    if (!conversations.some((x) => x.id === c)) {
      void refreshConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMessages((prev) => dedupe(prev.concat(optimistic)));

      socket?.emit("messaging:send", {
        conversationId: activeConversationId,
        content: text,
        type: "text",
      });
    },
    [activeConversationId, currentUserId, socket],
  );

  const sendFile = useCallback(
    async (file: File) => {
      if (!activeConversationId) return;
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMessages((prev) => dedupe(prev.concat(optimistic)));

      try {
        const { uploadService } = await import("@/services/upload.service");
        const uploaded = await uploadService.upload(
          file,
          "message",
          isImage ? "image" : "raw",
        );
        const saved = await messageService.sendMessage(activeConversationId, {
          content: file.name,
          type: isImage ? "IMAGE" : "FILE",
          fileUrl: uploaded.url,
          filePublicId: uploaded.publicId,
          fileName: file.name,
          fileSize: file.size,
        });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...saved, id: saved.id, fileUrl: uploaded.url, filePublicId: uploaded.publicId }
              : m,
          ),
        );
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        toast.error(err instanceof Error ? err.message : "Failed to send file.");
      }
    },
    [activeConversationId, currentUserId],
  );

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

  const profilePanelContent = activeConversation && (
    <UserProfilePanel
      conversation={activeConversation}
      currentUserId={currentUserId}
      onlineUsers={onlineUsers}
      sharedFiles={sharedFiles}
      onClose={() => setProfileOpen(false)}
    />
  );

  return (
    <>
      {status !== "connected" && (
        <div className="sticky top-0 z-20 flex items-center justify-center gap-2 bg-amber-500/10 py-1 text-xs text-amber-700">
          <Loader2 className="size-3 animate-spin" />
          {status === "connecting" ? "Connecting…" : "Reconnecting…"}
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
              setActiveConversationId(null);
              const params = new URLSearchParams(Array.from(searchParams.entries()));
              params.delete("c");
              window.history.replaceState(null, "", `?${params.toString()}`);
            }}
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
