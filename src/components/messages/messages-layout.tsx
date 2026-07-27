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
      {/* Mobile: single view, list OR chat with smooth transition */}
      <div className="flex-1 md:hidden">
        <div
          className={cn(
            "h-full transition-transform duration-200 ease-out",
            showChat ? "hidden" : "block",
          )}
        >
          {conversationList}
        </div>
        {showChat && (
          <div className="h-full animate-in fade-in slide-in-from-right-2 duration-200">
            {chat}
          </div>
        )}
      </div>

      {/* Tablet+: side-by-side with optional profile panel */}
      <div className="hidden flex-1 md:flex">
        <aside
          className={cn(
            "flex h-full shrink-0 flex-col border-r bg-background transition-all duration-200",
            "w-72 lg:w-80",
            showChat && "md:w-64 lg:w-72",
          )}
        >
          {conversationList}
        </aside>
        <main className="flex min-w-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            {showChat ? (
              <div className="animate-in fade-in duration-150">
                {chat}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                <div className="relative">
                  <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                    <MessageSquare className="size-10 text-primary/30" />
                  </div>
                  <div className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm">💬</span>
                  </div>
                </div>
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
          {profilePanel && (
            <aside className="w-80 shrink-0 border-l bg-background animate-in fade-in slide-in-from-right-2 duration-200">
              {profilePanel}
            </aside>
          )}
        </main>
      </div>
    </div>
  );
}
