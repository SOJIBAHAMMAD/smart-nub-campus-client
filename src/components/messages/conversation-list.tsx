"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, MessageSquare, Plus, Users, X } from "lucide-react";
import type { Conversation } from "@/types/message.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ConversationItem } from "./conversation-item";

type FilterTab = "all" | "unread" | "groups" | "pinned";

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  activeConversationId: string | null;
  onlineUsers: Set<string>;
  typingByConversation: Record<string, { active: boolean; names?: string[] }>;
  onSelect: (id: string) => void;
  onNewMessage: () => void;
  onNewGroup: () => void;
  className?: string;
}

export function ConversationList({
  conversations,
  currentUserId,
  activeConversationId,
  onlineUsers,
  typingByConversation,
  onSelect,
  onNewMessage,
  onNewGroup,
  className,
}: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return conversations
      .filter((c) => {
        if (filter === "unread" && (c.unreadCount ?? 0) <= 0) return false;
        if (filter === "groups" && c.type !== "GROUP") return false;
        if (filter === "pinned") {
          const me = c.conversationParticipants?.find((p) => p.userId === currentUserId);
          if (!me?.isPinned) return false;
        }
        if (!q) return true;
        const display = c.type === "GROUP"
          ? c.name ?? ""
          : (c.conversationParticipants
              ?.find((p) => p.userId !== currentUserId)
              ?.user?.name ?? "");
        const preview = c.lastMessage?.content ?? "";
        return (
          display.toLowerCase().includes(q) || preview.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Pinned conversations first
        const aPinned = a.conversationParticipants?.find((p) => p.userId === currentUserId)?.isPinned ?? false;
        const bPinned = b.conversationParticipants?.find((p) => p.userId === currentUserId)?.isPinned ?? false;
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return 0;
      });
  }, [conversations, filter, debouncedSearch, currentUserId]);

  const pinnedCount = useMemo(
    () => conversations.filter((c) => {
      const me = c.conversationParticipants?.find((p) => p.userId === currentUserId);
      return me?.isPinned;
    }).length,
    [conversations, currentUserId],
  );

  return (
    <div className={cn("flex h-full flex-col", className)} role="navigation" aria-label="Conversations">
      {/* Header with New buttons */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h2 className="text-base font-bold text-foreground">Chats</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onNewGroup} aria-label="New group">
            <Users className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onNewMessage} aria-label="New message">
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative px-3 pt-3 pb-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="pl-9 pr-8"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setDebouncedSearch("");
            }}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Tabs filter */}
      <div className="px-3 pb-2 pt-1">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              Unread
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex-1">Groups</TabsTrigger>
            {pinnedCount > 0 && (
              <TabsTrigger value="pinned" className="flex-1">
                Pinned
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      </div>

      {/* List */}
      <div
        className="min-h-0 flex-1 overflow-y-auto pb-2"
        role="list"
        aria-label="Conversation list"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
            <MessageSquare className="size-7 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">
              {search
                ? "No conversations found."
                : filter === "unread"
                  ? "No unread messages."
                  : filter === "pinned"
                    ? "No pinned conversations."
                    : "No conversations here."}
            </p>
            {!search && filter === "all" && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNewMessage}
                className="mt-2"
              >
                <Plus className="size-3.5 mr-1" />
                Start a conversation
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-0.5" role="list">
            {filtered.map((c) => (
              <ConversationItem
                key={c.id}
                conversation={c}
                currentUserId={currentUserId}
                active={c.id === activeConversationId}
                onlineUsers={onlineUsers}
                typing={typingByConversation[c.id]?.active ?? false}
                typingNames={typingByConversation[c.id]?.names}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
