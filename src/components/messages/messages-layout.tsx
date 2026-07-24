"use client";

import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessagesLayoutProps {
  conversationList: React.ReactNode;
  chat: React.ReactNode;
  profilePanel?: React.ReactNode;
  activeConversationId: string | null;
  className?: string;
}

export function MessagesLayout({
  conversationList,
  chat,
  profilePanel,
  activeConversationId,
  className,
}: MessagesLayoutProps) {
  const showChat = !!activeConversationId;

  return (
    <div
      className={cn(
        "mx-auto flex h-dvh w-full max-w-screen-2xl overflow-hidden md:h-[calc(100vh-4rem)]",
        className,
      )}
    >
      {/* Mobile: single view, list OR chat */}
      <div className="flex-1 md:hidden">
        {showChat ? chat : conversationList}
      </div>

      {/* Tablet+: side-by-side with optional profile panel */}
      <div className="hidden flex-1 md:flex">
        <aside className="flex h-full w-80 shrink-0 flex-col border-r bg-background md:w-72 lg:w-80">
          {conversationList}
        </aside>
        <main className="flex min-w-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            {showChat ? (
              chat
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                  <MessageSquare className="size-8 opacity-40" />
                </div>
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
          {profilePanel && (
            <aside className="w-80 shrink-0 border-l bg-background">
              {profilePanel}
            </aside>
          )}
        </main>
      </div>
    </div>
  );
}
