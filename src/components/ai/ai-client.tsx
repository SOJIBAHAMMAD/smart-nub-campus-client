/* TODO(AI-PAGE): Known issues to revisit — Phase 18 AI Assistant page. See commit/notes: 1) New-chat URL uses /ai?chat=<id> via createNewSession; confirm this matches desired route (some wanted /ai/<uuid> path segment). 2) Chat history title updates from server on first message — verify it shows promptly. 3) Verify send retry-on-not-found and clean URL across refresh/back-forward. 4) Re-check right sidebar (AI Tools removed per request). */
"use client";


import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles, Plus, Bot, MessageSquarePlus } from "lucide-react";
import type { AIChatSession, AIMessage } from "@/types/ai.types";
import { aiClientService } from "@/services/ai.client.service";
import { toast } from "sonner";
import { ChatMessage } from "@/components/ai/chat-message";
import { ChatInput } from "@/components/ai/chat-input";
import { QuickPrompts } from "@/components/ai/quick-prompts";
import { aiComposer, useComposerValue } from "@/components/ai/ai-composer-store";

/** Default prompt suggestions shown on the welcome screen. */
const DEFAULT_PROMPTS = [
  "Explain Data Structure",
  "Compare SQL vs NoSQL",
  "Write a Binary Search algorithm",
  "Summarize my notes on Operating Systems",
  "Generate quiz questions on DBMS",
];

interface AIClientProps {
  initialSessions: AIChatSession[];
  initialMessages: AIMessage[];
  initialActiveSessionId: string | null;
}

interface LocalMessage extends AIMessage {
  /** True while this message's AI reply is streaming in. */
  pending?: boolean;
}

/**
 * Interactive AI Assistant surface. A real chat-app style layout:
 * sticky header, scrollable message thread with avatars, a welcome
 * screen with suggestion cards, and a polished composer.
 *
 * Session identity lives in component state (not the URL) so the address
 * bar stays clean. Selecting a history item syncs via a `?chat=` id
 * built with URLSearchParams to avoid `undefined`/malformed params.
 */
export function AIClient({
  initialSessions,
  initialMessages,
  initialActiveSessionId,
}: AIClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [_sessions, setSessions] = useState<AIChatSession[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    initialActiveSessionId,
  );
  const [messages, setMessages] = useState<LocalMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  // Composer draft is shared with the sidebars via a small store so
  // Popular/Tool prompts can pre-fill it without touching the URL.
  const composerValue = useComposerValue();

  // Tracks the session whose messages are currently loaded, so we only
  // re-fetch when the user actually switches conversations.
  const loadedSessionRef = useRef<string | null>(initialActiveSessionId);

  const threadRef = useRef<HTMLDivElement>(null);

  // Keep client state in sync with a session selected via the sidebar
  // (?chat=id). When the user switches to a different conversation,
  // load its messages; when they start/return to a fresh chat, clear.
  useEffect(() => {
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    const urlSession = params.get("chat");
    if (urlSession === loadedSessionRef.current) return;

    setActiveSessionId(urlSession);
    loadedSessionRef.current = urlSession;

    if (!urlSession) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    aiClientService
      .getMessages(urlSession)
      .then((res) => {
        if (cancelled) return;
        const data = res as { messages?: AIMessage[] };
        setMessages(
          (data.messages ?? []).map((m) => ({ ...m })) as LocalMessage[],
        );
      })
      .catch(() => {
        // Session missing/deleted — fall back to a fresh chat and
        // strip the bad ?chat= param from the URL.
        if (!cancelled) {
          loadedSessionRef.current = null;
          setActiveSessionId(null);
          setMessages([]);
          router.replace(pathname);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  // Auto-scroll to the newest message.
  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  /**
   * Create a brand-new session, sync it into state AND the URL
   * (?chat=<id>) so refresh / back-forward returns to the same
   * conversation — consistent with how real chat apps behave.
   */
  const createNewSession = useCallback(async (): Promise<string> => {
    const session = await aiClientService.createSession({ title: "New Chat" });
    loadedSessionRef.current = session.id;
    setActiveSessionId(session.id);
    setSessions((prev) => [session, ...prev]);
    const params = new URLSearchParams();
    params.set("chat", session.id);
    router.replace(`${pathname}?${params.toString()}`);
    return session.id;
  }, [pathname, router]);

  /** Ensure there is a valid active session, creating one if needed. */
  const ensureSession = useCallback(async (): Promise<string> => {
    if (activeSessionId) return activeSessionId;
    return createNewSession();
  }, [activeSessionId, createNewSession]);

  /** Send a message, optimistically render it, then append the AI reply. */
  const handleSend = useCallback(
    async (content: string, attachmentName?: string) => {
      setLoading(true);
      const userText = attachmentName
        ? `${content}\n\n[Attachment: ${attachmentName}]`
        : content;

      // Optimistic user message.
      const tempUser: LocalMessage = {
        id: `temp-${Date.now()}`,
        sessionId: activeSessionId ?? "temp",
        role: "USER",
        content: userText,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUser]);
      aiComposer.clear();

      const trySend = async (sessionId: string) =>
        aiClientService.sendMessage(sessionId, { content: userText });

      try {
        const sessionId = await ensureSession();
        let result: Awaited<ReturnType<typeof trySend>>;
        try {
          result = await trySend(sessionId);
        } catch (sendErr) {
          const message =
            sendErr instanceof Error ? sendErr.message : "";
          const isNotFound =
            message.includes("not found") || message.includes("Not Found");
          if (isNotFound) {
            // Stale/non-existent session — start fresh and retry.
            loadedSessionRef.current = null;
            setActiveSessionId(null);
            const freshId = await createNewSession();
            result = await trySend(freshId);
          } else {
            throw sendErr;
          }
        }

        // Keep the optimistic user bubble and append the AI response.
        setMessages((prev) => [
          ...prev,
          {
            id: result.aiMessage.id,
            sessionId,
            role: "ASSISTANT",
            content: result.aiMessage.content,
            createdAt: result.aiMessage.createdAt,
            isHelpful: result.aiMessage.isHelpful ?? null,
          },
        ]);

        // Refresh session list (titles may have updated) silently.
        aiClientService
          .listSessions({ limit: 50 })
          .then((res) => setSessions(res.sessions ?? []))
          .catch(() => {});
      } catch (err) {
        // Roll back the optimistic message on failure.
        setMessages((prev) => prev.filter((m) => m.id !== tempUser.id));
        console.error("[AI] send failed:", err);
        const msg =
          err instanceof Error ? err.message : "Failed to send message.";
        toast.error(msg || "Failed to send message. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [activeSessionId, ensureSession, createNewSession],
  );

  /** Submit feedback for an AI message. */
  const handleFeedback = useCallback(
    async (messageId: string, isHelpful: boolean) => {
      try {
        await aiClientService.markHelpful(messageId, isHelpful);
      } catch {
        toast.error("Failed to record feedback.");
      }
    },
    [],
  );

  /** Start a new chat (clear active session, keep URL clean). */
  const handleNewChat = useCallback(() => {
    loadedSessionRef.current = null;
    setActiveSessionId(null);
    setMessages([]);
    aiComposer.clear();
    router.push(pathname);
  }, [pathname, router]);

  const showWelcome = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm ring-1 ring-foreground/5">
      {/* ── Chat header ─────────────────────────────────────── */}
      <header className="flex items-center justify-between gap-3 border-b bg-card/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-hover text-white shadow-sm">
            <Sparkles className="size-4.5" />
          </span>
          <div>
            <h1 className="text-sm font-semibold leading-tight text-foreground">
              AI Assistant
            </h1>
            <p className="text-[11px] leading-tight text-muted-foreground">
              {activeSessionId ? "Conversation in progress" : "Your study companion"}
            </p>
          </div>
        </div>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-1.5 rounded-xl bg-brand px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-brand/90 active:translate-y-px"
        >
          <Plus className="size-3.5" />
          New Chat
        </button>
      </header>

      {/* ── Chat thread ─────────────────────────────────────── */}
      <div
        ref={threadRef}
        className="flex-1 overflow-y-auto bg-gradient-to-b from-muted/40 to-background px-4 py-5"
      >
        {showWelcome ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-hover text-white shadow-lg">
              <Bot className="size-8" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
              How can I help you study today?
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Ask anything about your courses, generate quizzes, summarize
              notes, or debug code. I&apos;m here to help you learn faster.
            </p>

            {/* Suggestion cards */}
            <div className="mt-8 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
              {DEFAULT_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="group flex items-start gap-2.5 rounded-xl border bg-card p-3 text-left text-sm text-foreground shadow-sm ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                >
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <MessageSquarePlus className="size-3.5" />
                  </span>
                  <span className="leading-snug">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onFeedback={handleFeedback}
              />
            ))}
            {loading && (
              <div className="flex w-full gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-hover text-white shadow-sm">
                  <Bot className="size-4" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-card px-4 py-3.5 shadow-sm ring-1 ring-foreground/5">
                  <span className="size-2 animate-bounce rounded-full bg-brand [animation-delay:-0.3s]" />
                  <span className="size-2 animate-bounce rounded-full bg-brand [animation-delay:-0.15s]" />
                  <span className="size-2 animate-bounce rounded-full bg-brand" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Composer ────────────────────────────────────────── */}
      <div className="border-t bg-card px-4 py-3">
        <div className="mx-auto max-w-3xl">
          {!showWelcome && (
            <div className="mb-2">
              <QuickPrompts
                prompts={DEFAULT_PROMPTS}
                onSelect={(p) => handleSend(p)}
              />
            </div>
          )}
          <ChatInput
            onSend={handleSend}
            disabled={loading}
            initialValue={composerValue}
            placeholder="Message AI Assistant…"
          />
        </div>
      </div>
    </div>
  );
}
