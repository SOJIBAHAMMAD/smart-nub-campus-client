/* TODO(AI-PAGE): Known issues to revisit — Phase 18 AI Assistant page. See commit/notes: 1) New-chat URL uses /ai?chat=<id> via createNewSession; confirm this matches desired route (some wanted /ai/<uuid> path segment). 2) Chat history title updates from server on first message — verify it shows promptly. 3) Verify send retry-on-not-found and clean URL across refresh/back-forward. 4) Re-check right sidebar (AI Tools removed per request). */
"use client";


import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Plus, Sparkles, FileText, HelpCircle, Layers, Code, Trash2, Settings } from "lucide-react";
import type { AIChatSession } from "@/types/ai.types";
import { ChatHistoryItem } from "@/components/ai/chat-history-item";
import { ToolCard } from "@/components/ai/tool-card";
import { aiClientService } from "@/services/ai.client.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { aiComposer } from "@/components/ai/ai-composer-store";

/** Quick tools surfaced in the sidebar grid. */
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

/**
 * Left sidebar for the AI Assistant page.
 * Provides the New Chat action, conversation history (with delete),
 * a quick-tools grid, and settings shortcuts.
 */
export function AISidebar({ sessions, activeSessionId }: AISidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Start a brand new conversation by clearing the active chat param.
  const handleNewChat = () => {
    router.push(`${pathname}`);
  };

  // Select an existing conversation (build the URL safely to avoid
  // malformed/undefined query params).
  const handleSelectSession = (id: string) => {
    if (!id) {
      router.push(pathname);
      return;
    }
    const params = new URLSearchParams();
    params.set("chat", id);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Delete a conversation from history.
  const handleDeleteSession = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await aiClientService.deleteSession(id);
      toast.success("Conversation deleted.");
      if (activeSessionId === id) {
        router.push(`${pathname}`);
      } else {
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete conversation.");
    } finally {
      setDeletingId(null);
    }
  };

  // Launch a quick tool by pre-filling the composer with a tool
  // prompt prefix (does not navigate or pollute the URL).
  const handleToolSelect = (prompt: string) => {
    aiComposer.append(prompt.trim());
  };

  return (
    <div className="space-y-6">
      {/* ── New Chat ──────────────────────────────────────────── */}
      <button
        onClick={handleNewChat}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand/90 active:translate-y-px"
      >
        <Plus className="size-4" />
        New Chat
      </button>

      {/* ── Chat History ──────────────────────────────────────── */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Chat History
        </h3>
        {sessions.length > 0 ? (
          <div className="space-y-1">
            {sessions.map((session) => (
              <ChatHistoryItem
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                disabled={deletingId === session.id}
                onSelect={() => handleSelectSession(session.id)}
                onDelete={() => handleDeleteSession(session.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No conversations yet.</p>
        )}
      </div>

      {/* ── Quick Tools ──────────────────────────────────────── */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Tools
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_TOOLS.map((tool) => (
            <ToolCard
              key={tool.id}
              name={tool.name}
              description={tool.description}
              icon={tool.icon}
              onClick={() => handleToolSelect(tool.prompt)}
            />
          ))}
        </div>
      </div>

      {/* ── Settings ─────────────────────────────────────────── */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Settings
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => {
              if (sessions.length === 0) return;
              if (
                window.confirm(
                  "Clear all chat history? This cannot be undone.",
                )
              ) {
                Promise.all(sessions.map((s) => aiClientService.deleteSession(s.id)))
                  .then(() => {
                    toast.success("Chat history cleared.");
                    router.push(`${pathname}`);
                  })
                  .catch(() => toast.error("Failed to clear history."));
              }
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Trash2 className="size-4" />
            Clear History
          </button>
          <button
            onClick={() =>
              toast.info("Preferences coming soon.")
            }
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Settings className="size-4" />
            Preferences
          </button>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs text-muted-foreground",
        )}
      >
        <Sparkles className="size-4 text-primary" />
        Mock AI mode — real LLM coming soon.
      </div>
    </div>
  );
}
