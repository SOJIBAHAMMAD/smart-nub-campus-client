"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, MessageSquare, Trash2, FileText, HelpCircle, Layers, Code,
} from "lucide-react";
import type { AIChatSession } from "@/types/ai.types";
import { aiClientService } from "@/services/ai.client.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { aiComposer } from "@/components/ai/ai-composer-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const QUICK_TOOLS = [
  {
    id: "pdf-summarizer",
    name: "PDF Summarizer",
    description: "Condense long notes",
    icon: FileText,
    prompt: "Summarize the following PDF notes for me: ",
  },
  {
    id: "quiz-generator",
    name: "Quiz Generator",
    description: "Test your knowledge",
    icon: HelpCircle,
    prompt: "Generate a quiz for me on the following topic: ",
  },
  {
    id: "flashcards",
    name: "Flashcards",
    description: "Memorize faster",
    icon: Layers,
    prompt: "Create flashcards for the following topic: ",
  },
  {
    id: "code-helper",
    name: "Code Helper",
    description: "Explain & debug code",
    icon: Code,
    prompt: "Help me understand and debug this code: ",
  },
];

interface AISidebarProps {
  sessions: AIChatSession[];
  activeSessionId: string | null;
}

export function AISidebar({ sessions, activeSessionId }: AISidebarProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleNewChat = () => {
    router.push("/ai");
  };

  const handleSelectSession = (id: string) => {
    if (!id) {
      router.push("/ai");
      return;
    }
    router.push(`/ai/${id}`);
  };

  const handleDeleteSession = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await aiClientService.deleteSession(id);
      toast.success("Conversation deleted.");
      if (activeSessionId === id) {
        router.push("/ai");
      } else {
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete conversation.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToolSelect = (prompt: string) => {
    aiComposer.append(prompt.trim());
  };

  return (
    <div className="space-y-6">
      <Button onClick={handleNewChat} className="w-full gap-1.5 rounded-xl">
        <Plus className="size-4" />
        New Chat
      </Button>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Chat History
        </h3>
        {sessions.length > 0 ? (
          <div className="space-y-1">
            {sessions.map((session) => {
              const title = session.title || "New Chat";
              const created = new Date(session.createdAt);
              const label = created.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    deletingId === session.id && "opacity-50 pointer-events-none",
                  )}
                >
                  <button
                    onClick={() => handleSelectSession(session.id)}
                    disabled={deletingId === session.id}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <MessageSquare className="size-4 shrink-0" />
                    <span className="truncate">{title}</span>
                  </button>
                  <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                    {label}
                  </span>
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    disabled={deletingId === session.id}
                    aria-label="Delete conversation"
                    className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center">
            <MessageSquare className="size-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">
              No conversations yet.
            </p>
            <p className="text-[10px] text-muted-foreground/60">
              Start a new chat to begin.
            </p>
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Tools
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_TOOLS.map((tool) => (
            <Card
              key={tool.id}
              interactive
              size="sm"
              onClick={() => handleToolSelect(tool.prompt)}
              className="group gap-2 p-3 transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md"
            >
              <CardContent className="flex flex-col items-start gap-1.5 p-0">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <tool.icon className="size-4" />
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {tool.name}
                </span>
                <span className="text-[10px] leading-tight text-muted-foreground">
                  {tool.description}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
