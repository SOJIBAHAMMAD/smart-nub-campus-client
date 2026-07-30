"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Sparkles, Plus, Bot, User, Square, RefreshCw, Copy, Check,
  ThumbsUp, ThumbsDown, MessageSquarePlus, SendHorizonal, Paperclip,
  X, File as FileIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "motion/react";
import { isSameDay, format, differenceInCalendarDays } from "date-fns";
import type { AIChatSession, AIMessage, AIAttachment } from "@/types/ai.types";
import { aiClientService } from "@/services/ai.client.service";
import { toast } from "sonner";
import { aiComposer, useComposerValue } from "@/components/ai/ai-composer-store";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";
import { CodeBlockRenderer } from "@/components/ai/render-structured";
import {
  parseCitations,
  CitationSources,
  MessageCitationLink,
} from "@/components/ai/citations";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
  MessageFooter,
} from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Marker, MarkerContent } from "@/components/ui/marker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SUGGESTIONS_POOL = [
  "Explain this in more detail",
  "Give me a real-world example",
  "Summarize the key points",
  "What are the prerequisites for this topic?",
  "Compare this with similar concepts",
  "Quiz me on this topic",
  "Create flashcards for review",
  "What are common mistakes to avoid?",
];

function getRelativeDateLabel(date: Date): string {
  const now = new Date();
  const diff = differenceInCalendarDays(now, date);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return format(date, "EEEE");
  return format(date, "MMMM d, yyyy");
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function autoResize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, 192)}px`;
}

function ShimmerDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Thinking">
      <span className="size-1.5 animate-bounce rounded-full bg-current opacity-60 [animation-delay:0ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-current opacity-60 [animation-delay:150ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-current opacity-60 [animation-delay:300ms]" />
    </span>
  );
}

interface AIClientProps {
  initialSessions: AIChatSession[];
  initialMessages: AIMessage[];
  initialActiveSessionId: string | null;
}

export function AIClient({
  initialSessions,
  initialMessages,
  initialActiveSessionId,
}: AIClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [sessions, setSessions] = useState<AIChatSession[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    initialActiveSessionId,
  );
  const [messages, setMessages] = useState<AIMessage[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [reasoningText, setReasoningText] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<AIAttachment[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  const loadedSessionRef = useRef<string | null>(initialActiveSessionId);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const composerValue = useComposerValue();

  const hasMessages = messages.length > 0;
  const showWelcome = !hasMessages && !loading;

  const dateSeparators = useMemo(() => {
    const separators = new Set<number>();
    for (let i = 0; i < messages.length; i++) {
      const current = new Date(messages[i].createdAt);
      if (i === 0) {
        separators.add(0);
      } else {
        const prev = new Date(messages[i - 1].createdAt);
        if (!isSameDay(current, prev)) {
          separators.add(i);
        }
      }
    }
    return separators;
  }, [messages]);

  const lastAssistantContent = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "ASSISTANT" && messages[i].content) {
        return messages[i].content;
      }
    }
    return "";
  }, [messages]);

  const showSuggestions = !isStreaming && hasMessages && lastAssistantContent;

  useEffect(() => {
    if (showSuggestions) {
      const shuffled = [...SUGGESTIONS_POOL]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      setSuggestions(shuffled);
    } else {
      setSuggestions([]);
    }
  }, [showSuggestions, lastAssistantContent]);

  // Esc key to stop streaming
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isStreaming) {
        abortRef.current?.abort();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isStreaming]);

  // Seed composer when sidebar prompt is clicked
  useEffect(() => {
    if (composerValue) {
      setInputValue(composerValue);
    }
  }, [composerValue]);

  // Auto-resize textarea on input change
  useEffect(() => {
    autoResize(textareaRef.current);
  }, [inputValue]);

  // Sync active session from URL
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
        setMessages((data.messages ?? []).map((m) => ({ ...m })));
      })
      .catch(() => {
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

    return () => { cancelled = true; };
  }, [pathname, router]);

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

  const ensureSession = useCallback(async (): Promise<string> => {
    if (activeSessionId) return activeSessionId;
    return createNewSession();
  }, [activeSessionId, createNewSession]);

  const handleSend = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed && pendingAttachments.length === 0) return;
      if (isStreaming) return;

      aiComposer.clear();
      setInputValue("");
      setSuggestions([]);
      setReasoningText("");

      let sessionId: string;
      try {
        sessionId = await ensureSession();
      } catch {
        toast.error("Failed to create session");
        return;
      }

      const attachmentIds = pendingAttachments.map((a) => a.id);

      const tempUser: AIMessage = {
        id: `temp-user-${Date.now()}`,
        sessionId,
        role: "USER",
        content: trimmed,
        attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
        createdAt: new Date().toISOString(),
      };

      const tempAi: AIMessage = {
        id: `temp-ai-${Date.now()}`,
        sessionId,
        role: "ASSISTANT",
        content: "",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempUser, tempAi]);
      setPendingAttachments([]);
      setIsStreaming(true);
      setReasoningText("");

      const ac = new AbortController();
      abortRef.current = ac;

      let accumulated = "";
      let reasoningAccumulated = "";

      try {
        await aiClientService.sendMessageStream(
          sessionId,
          { content: trimmed, attachmentIds },
          (chunk) => {
            if (chunk.type === "text" && chunk.content) {
              accumulated += chunk.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempAi.id ? { ...m, content: accumulated } : m,
                ),
              );
            } else if (chunk.type === "reasoning" && chunk.content) {
              reasoningAccumulated += chunk.content;
              setReasoningText(reasoningAccumulated);
            } else if (chunk.type === "error") {
              toast.error(chunk.content || "An error occurred");
            }
          },
          ac.signal,
        );

        setIsStreaming(false);

        aiClientService
          .listSessions({ limit: 50 })
          .then((res) => setSessions(res.sessions ?? []))
          .catch(() => {});
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setIsStreaming(false);
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== tempAi.id));
          toast.error("Failed to get response");
          setIsStreaming(false);
        }
      }
    },
    [isStreaming, ensureSession, pendingAttachments],
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

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

  const handleRegenerate = useCallback(async () => {
    if (messages.length < 2 || isStreaming) return;

    const lastUser = [...messages].reverse().find((m) => m.role === "USER");
    const lastAi = [...messages].reverse().find((m) => m.role === "ASSISTANT");

    if (!lastUser || !lastAi) return;

    setMessages((prev) => prev.filter((m) => m.id !== lastAi.id));
    await handleSend(lastUser.content);
  }, [messages, isStreaming, handleSend]);

  const handleNewChat = useCallback(() => {
    loadedSessionRef.current = null;
    setActiveSessionId(null);
    setMessages([]);
    aiComposer.clear();
    setInputValue("");
    setSuggestions([]);
    router.push(pathname);
  }, [pathname, router]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const sessionId = await ensureSession();
      const attachment = await aiClientService.uploadAttachment(sessionId, file);
      setPendingAttachments((prev) => [...prev, attachment]);
      toast.success(`Uploaded ${file.name}`);
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSuggestionClick = (prompt: string) => {
    handleSend(prompt);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm ring-1 ring-foreground/5">
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
              {isStreaming
                ? "Generating response..."
                : activeSessionId
                  ? "Conversation in progress"
                  : "Your study companion"}
            </p>
          </div>
        </div>
        <Button
          onClick={handleNewChat}
          size="sm"
          className="gap-1.5"
        >
          <Plus className="size-3.5" />
          New Chat
        </Button>
      </header>

      <MessageScrollerProvider autoScroll scrollPreviousItemPeek={48}>
        <MessageScroller className="flex-1">
          <MessageScrollerViewport className="bg-gradient-to-b from-muted/40 to-background">
            <MessageScrollerContent>
              {showWelcome ? (
                <div className="flex h-full min-h-[30rem] flex-col items-center justify-center px-4 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-hover text-white shadow-lg">
                      <Bot className="size-8" />
                    </span>
                    <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
                      How can I help you study today?
                    </h2>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                      Ask anything about your courses, generate quizzes, summarize
                      notes, or debug code.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="mt-8 grid w-full max-w-lg grid-cols-1 gap-2.5 sm:grid-cols-2"
                  >
                    <PromptCard
                      icon={MessageSquarePlus}
                      label="Explain Data Structures"
                      onClick={() => handleSend("Explain Data Structure")}
                    />
                    <PromptCard
                      icon={MessageSquarePlus}
                      label="Compare SQL vs NoSQL"
                      onClick={() => handleSend("Compare SQL vs NoSQL")}
                    />
                    <PromptCard
                      icon={MessageSquarePlus}
                      label="Write a Binary Search"
                      onClick={() => handleSend("Write a Binary Search algorithm")}
                    />
                    <PromptCard
                      icon={MessageSquarePlus}
                      label="Summarize OS Notes"
                      onClick={() => handleSend("Summarize my notes on Operating Systems")}
                    />
                    <PromptCard
                      icon={MessageSquarePlus}
                      label="Generate Quiz on DBMS"
                      onClick={() => handleSend("Generate quiz questions on DBMS")}
                    />
                    <PromptCard
                      icon={MessageSquarePlus}
                      label="Explain Linked Lists"
                      onClick={() => handleSend("Explain linked lists vs arrays")}
                    />
                  </motion.div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={msg.id}>
                    {dateSeparators.has(idx) && (
                      <MessageScrollerItem>
                        <Marker variant="separator">
                          <MarkerContent>
                            {getRelativeDateLabel(new Date(msg.createdAt))}
                          </MarkerContent>
                        </Marker>
                      </MessageScrollerItem>
                    )}
                    <MessageScrollerItem
                      messageId={msg.id}
                      scrollAnchor={msg.role === "USER"}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Message align={msg.role === "USER" ? "end" : "start"}>
                          <MessageAvatar>
                            <span
                              className={cn(
                                "flex size-8 items-center justify-center rounded-full text-white shadow-sm",
                                msg.role === "USER"
                                  ? "bg-brand"
                                  : "bg-gradient-to-br from-brand to-brand-hover",
                              )}
                            >
                              {msg.role === "USER" ? (
                                <User className="size-4" />
                              ) : (
                                <Bot className="size-4" />
                              )}
                            </span>
                          </MessageAvatar>
                          <MessageContent>
                            <MessageHeader>
                              <span className="text-xs font-medium">
                                {msg.role === "USER" ? "You" : "AI Assistant"}
                              </span>
                              {msg.createdAt && (
                                <span className="text-[11px] text-muted-foreground">
                                  {formatTime(msg.createdAt)}
                                </span>
                              )}
                            </MessageHeader>
                            <Bubble
                              variant={msg.role === "USER" ? "default" : "muted"}
                            >
                              <BubbleContent>
                                {msg.role === "USER" ? (
                                  <div className="flex flex-col gap-2">
                                    {msg.attachments && msg.attachments.length > 0 && (
                                      <div className="flex gap-2">
                                        {msg.attachments.map((att) => (
                                          <div
                                            key={att.id}
                                            className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-xs text-foreground"
                                          >
                                            <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                                            <span className="truncate max-w-32">
                                              {att.fileName}
                                            </span>
                                            {att.fileSize && (
                                              <span className="text-muted-foreground text-[10px]">
                                                {Math.round(att.fileSize / 1024)}KB
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    <p className="whitespace-pre-wrap text-sm">
                                      {msg.content}
                                    </p>
                                  </div>
                                ) : msg.content ? (
                                  <MessageCitationsRenderer
                                    content={msg.content}
                                    isLatest={idx === messages.length - 1}
                                    isStreaming={isStreaming}
                                    reasoningText={reasoningText}
                                  />
                                ) : (
                                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    Thinking
                                    <ShimmerDots />
                                  </span>
                                )}
                              </BubbleContent>
                            </Bubble>
                            {msg.role === "ASSISTANT" && msg.content && (
                              <MessageFooter>
                                <MessageActions
                                  content={msg.content}
                                  messageId={msg.id}
                                  isLast={idx === messages.length - 1}
                                  onFeedback={handleFeedback}
                                  onRegenerate={handleRegenerate}
                                />
                              </MessageFooter>
                            )}
                          </MessageContent>
                        </Message>
                      </motion.div>
                    </MessageScrollerItem>
                  </div>
                ))
              )}

              {/* Suggested follow-ups */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <MessageScrollerItem>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="px-14 pb-3 pt-1"
                    >
                      <span className="mb-2 block text-[11px] font-medium text-muted-foreground">
                        Follow-up
                      </span>
                      <Suggestions>
                        {suggestions.map((s) => (
                          <Suggestion
                            key={s}
                            suggestion={s}
                            onClick={handleSuggestionClick}
                          />
                        ))}
                      </Suggestions>
                    </motion.div>
                  </MessageScrollerItem>
                )}
              </AnimatePresence>
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      {/* ── Composer ──────────────────────────────────────────── */}
      <div className="border-t bg-card px-4 py-3">
        {pendingAttachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {pendingAttachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1 text-xs text-foreground"
              >
                <FileIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate max-w-32">{att.fileName}</span>
                {uploadingFile && att.id === pendingAttachments[pendingAttachments.length - 1]?.id && (
                  <span className="text-muted-foreground text-[10px]">uploading...</span>
                )}
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="ml-1 text-muted-foreground hover:text-destructive"
                  aria-label="Remove attachment"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            aria-hidden="true"
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming}
            aria-label="Attach file"
          >
            <Paperclip className="size-4" />
          </Button>
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={pendingAttachments.length > 0 ? "Add a caption…" : "Ask anything about your courses…"}
              disabled={isStreaming}
              className="max-h-48 w-full resize-none rounded-xl border bg-muted/40 px-4 py-3 pr-10 text-sm text-foreground outline-none ring-1 ring-foreground/5 transition-colors placeholder:text-muted-foreground focus:border-brand/40 focus:bg-card focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {isStreaming && (
              <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5">
                <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
                <span className="text-[10px] text-destructive">Streaming</span>
              </div>
            )}
          </div>
          {isStreaming ? (
            <Button
              onClick={handleStop}
              variant="secondary"
              size="icon"
              className="shrink-0"
              aria-label="Stop generating (Esc)"
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim() && pendingAttachments.length === 0}
              size="icon"
              className="shrink-0"
              aria-label="Send message"
            >
              <SendHorizonal className="size-4" />
            </Button>
          )}
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground/60">
          Shift+Enter for new line &middot; Esc to stop &middot; Paperclip to attach
        </p>
      </div>
    </div>
  );
}

/* ── Citations renderer for assistant messages ────────── */

function MessageCitationsRenderer({
  content,
  isLatest,
  isStreaming,
  reasoningText,
}: {
  content: string;
  isLatest: boolean;
  isStreaming: boolean;
  reasoningText: string;
}) {
  const { cleanedText, sources } = useMemo(() => parseCitations(content), [content]);

  return (
    <div>
      {reasoningText && isLatest && (
        <Reasoning isStreaming={isStreaming}>
          <ReasoningTrigger />
          <ReasoningContent>
            {reasoningText}
          </ReasoningContent>
        </Reasoning>
      )}
      <div className="prose prose-sm max-w-none break-words dark:prose-invert prose-pre:rounded-lg prose-pre:bg-muted prose-pre:text-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-table:overflow-x-auto">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            pre: ({ children }) => <>{children}</>,
            code: CodeBlockRenderer,
            a: ({ href, children }) => (
              <MessageCitationLink href={href ?? ""} sources={sources}>
                {children}
              </MessageCitationLink>
            ),
          }}
        >
          {cleanedText}
        </ReactMarkdown>
      </div>
      <CitationSources sources={sources} />
    </div>
  );
}

/* ── Prompt card for empty state ────────────────────────────── */

function PromptCard({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-2.5 rounded-xl border bg-card p-3 text-left text-sm text-foreground shadow-sm ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
    >
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className="size-3.5" />
      </span>
      <span className="leading-snug">{label}</span>
    </button>
  );
}

/* ── Inline message action buttons ─────────────────────────────── */

interface MessageActionsProps {
  content: string;
  messageId: string;
  isLast: boolean;
  onFeedback: (id: string, helpful: boolean) => void;
  onRegenerate: () => void;
}

function MessageActions({
  content,
  messageId,
  isLast,
  onFeedback,
  onRegenerate,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<boolean | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={handleCopy}
        aria-label="Copy message"
        className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {copied ? (
          <Check className="size-3.5 text-primary" />
        ) : (
          <Copy className="size-3.5" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
      {isLast && (
        <button
          onClick={onRegenerate}
          aria-label="Regenerate response"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RefreshCw className="size-3.5" />
          Regenerate
        </button>
      )}
      <div className="mx-1 h-3 w-px bg-border" />
      <button
        onClick={() => {
          setFeedback(true);
          onFeedback(messageId, true);
        }}
        aria-label="Like message"
        className={cn(
          "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors hover:bg-muted hover:text-foreground",
          feedback === true && "text-primary",
        )}
      >
        <ThumbsUp className="size-3.5" />
      </button>
      <button
        onClick={() => {
          setFeedback(false);
          onFeedback(messageId, false);
        }}
        aria-label="Dislike message"
        className={cn(
          "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors hover:bg-muted hover:text-foreground",
          feedback === false && "text-destructive",
        )}
      >
        <ThumbsDown className="size-3.5" />
      </button>
    </div>
  );
}
