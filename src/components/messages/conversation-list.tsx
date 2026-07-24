"use client";

import { useState, useMemo } from "react";
import { Search, MessageSquare, Plus, Users } from "lucide-react";
import type { Conversation } from "@/types/message.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ConversationItem } from "./conversation-item";

type FilterTab = "all" | "unread" | "groups";

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
  const [filter, setFilter] = useState<FilterTab>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      if (filter === "unread" && (c.unreadCount ?? 0) <= 0) return false;
      if (filter === "groups" && c.type !== "GROUP") return false;
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
    });
  }, [conversations, filter, search, currentUserId]);

  return (
    <div className={cn("flex h-full flex-col", className)}>
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
          className="pl-9"
        />
      </div>

      {/* Tabs filter */}
      <div className="px-3 pb-2 pt-1">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
            <TabsTrigger value="groups" className="flex-1">Groups</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
            <MessageSquare className="size-7 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">
              {search ? "No conversations found." : "No conversations here."}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
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
