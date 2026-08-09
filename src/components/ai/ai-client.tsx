"use client";

import { memo, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, Plus, Bot, Square, RefreshCw, Copy, Check,
  ThumbsUp, ThumbsDown, MessageSquarePlus, SendHorizonal, Paperclip,
  X, File as FileIcon, Pencil,
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

import { detectAndRender } from "@/components/ai/render-structured";
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
import { Avatar } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
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

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Thinking">
      <span className="size-1.5 animate-bounce rounded-full bg-current opacity-60 [animation-delay:0ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-current opacity-60 [animation-delay:150ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-current opacity-60 [animation-delay:300ms]" />
    </span>
  );
}

function StreamingTypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-1 py-1.5">
      <span className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-hover text-white shadow-sm">
        <Bot className="size-3.5" />
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-success ring-2 ring-card">
          <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60" />
        </span>
      </span>
      <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5">
        <span className="text-sm text-muted-foreground">Thinking</span>
        <TypingDots />
      </div>
    </div>
  );
}

interface AIClientProps {
  initialSessions: AIChatSession[];
  initialMessages: AIMessage[];
  initialActiveSessionId: string | null;
}

const MessagesArea = memo(function MessagesArea({
  messages,
  dateSeparators,
  showWelcome,
  showSuggestions,
  suggestions,
  isStreaming,
  reasoningText,
  editingMessageId,
  editValue,
  editTextareaRef,
  user,
  onSend,
  onFeedback,
  onRegenerate,
  onSuggestionClick,
  onEditStart,
  onEditValueChange,
  onEditSave,
  onEditCancel,
}: {
  messages: AIMessage[];
  dateSeparators: Set<number>;
  showWelcome: boolean;
  showSuggestions: boolean;
  suggestions: string[];
  isStreaming: boolean;
  reasoningText: string;
  editingMessageId: string | null;
  editValue: string;
  editTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  user: { id?: string; name?: string | null; image?: string | null } | undefined;
  onSend: (content: string) => void;
  onFeedback: (messageId: string, isHelpful: boolean) => Promise<void>;
  onRegenerate: () => Promise<void>;
  onSuggestionClick: (prompt: string) => void;
  onEditStart: (messageId: string, content: string) => void;
  onEditValueChange: (value: string) => void;
  onEditSave: (messageId: string, content: string) => void;
  onEditCancel: () => void;
}) {
  return (
    <MessageScrollerProvider autoScroll scrollPreviousItemPeek={48}>
      <MessageScroller className="flex-1">
        <MessageScrollerViewport className="bg-gradient-to-b from-muted/30 to-background">
          <MessageScrollerContent>
            {showWelcome ? (
              <div className="flex h-full min-h-[30rem] flex-col items-center justify-center px-4 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-hover text-white shadow-lg ring-1 ring-white/20">
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
                    onClick={() => onSend("Explain Data Structures")}
                  />
                  <PromptCard
                    icon={MessageSquarePlus}
                    label="Compare SQL vs NoSQL"
                    onClick={() => onSend("Compare SQL vs NoSQL")}
                  />
                  <PromptCard
                    icon={MessageSquarePlus}
                    label="Write a Binary Search"
                    onClick={() => onSend("Write a Binary Search algorithm")}
                  />
                  <PromptCard
                    icon={MessageSquarePlus}
                    label="Summarize OS Notes"
                    onClick={() => onSend("Summarize my notes on Operating Systems")}
                  />
                  <PromptCard
                    icon={MessageSquarePlus}
                    label="Generate Quiz on DBMS"
                    onClick={() => onSend("Generate quiz questions on DBMS")}
                  />
                  <PromptCard
                    icon={MessageSquarePlus}
                    label="Explain Linked Lists"
                    onClick={() => onSend("Explain linked lists vs arrays")}
                  />
                </motion.div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={msg.id}>
                  {dateSeparators.has(idx) && (
                    <MessageScrollerItem>
                      <Marker
                        variant="separator"
                        className="px-4 py-1"
                      >
                        <MarkerContent className="text-[11px] font-medium text-muted-foreground">
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
                      {editingMessageId === msg.id && msg.role === "USER" ? (
                        <div className="flex flex-col gap-2 px-14 pb-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Edit message
                          </span>
                          <textarea
                            ref={editTextareaRef}
                            value={editValue}
                            onChange={(e) => onEditValueChange(e.target.value)}
                            rows={3}
                            className="w-full resize-none rounded-xl border bg-muted/40 px-4 py-3 text-sm text-foreground outline-none ring-1 ring-foreground/5 transition-colors placeholder:text-muted-foreground focus:border-brand/40 focus:bg-card focus:ring-brand/20"
                            autoFocus
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => onEditSave(msg.id, editValue)}
                              disabled={!editValue.trim()}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={onEditCancel}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Message align={msg.role === "USER" ? "end" : "start"}>
                          <MessageAvatar>
                            {msg.role === "USER" ? (
                              <Avatar
                                id={user?.id}
                                name={user?.name ?? undefined}
                                src={user?.image ?? undefined}
                                className="size-8"
                              />
                            ) : (
                              <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-hover text-white shadow-sm">
                                <Bot className="size-4" />
                              </span>
                            )}
                          </MessageAvatar>
                          <MessageContent className="max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]">
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
                                      <div className="flex flex-wrap gap-2">
                                        {msg.attachments.map((att) => (
                                          <div
                                            key={att.id}
                                            className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-primary-foreground/90"
                                          >
                                            <FileIcon className="size-4 shrink-0 text-primary-foreground/70" />
                                            <span className="truncate max-w-32">
                                              {att.fileName}
                                            </span>
                                            {att.fileSize && (
                                              <span className="text-primary-foreground/60 text-[10px]">
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
                                    isLatest={idx === messages.length - 1 && isStreaming}
                                    isStreaming={isStreaming}
                                    reasoningText={
                                      idx === messages.length - 1 ? reasoningText : ""
                                    }
                                  />
                                ) : (
                                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    Thinking
                                    <TypingDots />
                                  </span>
                                )}
                              </BubbleContent>
                            </Bubble>
                            <MessageFooter>
                              {msg.role === "USER" ? (
                                !isStreaming && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => onEditStart(msg.id, msg.content)}
                                      aria-label="Edit message"
                                      className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    >
                                      <Pencil className="size-3.5" />
                                      Edit
                                    </button>
                                  </div>
                                )
                              ) : msg.content && (
                                <MessageActions
                                  content={msg.content}
                                  messageId={msg.id}
                                  isLast={idx === messages.length - 1}
                                  onFeedback={onFeedback}
                                  onRegenerate={onRegenerate}
                                />
                              )}
                            </MessageFooter>
                          </MessageContent>
                        </Message>
                      )}
                    </motion.div>
                  </MessageScrollerItem>
                </div>
              ))
            )}

            {isStreaming && messages.length > 0 && !messages[messages.length - 1]?.content && (
              <MessageScrollerItem>
                <StreamingTypingIndicator />
              </MessageScrollerItem>
            )}

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
                    <span className="mb-2.5 block text-[11px] font-medium text-muted-foreground">
                      Follow-up questions
                    </span>
                    <Suggestions>
                      {suggestions.map((s) => (
                        <Suggestion
                          key={s}
                          suggestion={s}
                          onClick={onSuggestionClick}
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
  );
});

export function AIClient({
  initialSessions,
  initialMessages,
  initialActiveSessionId,
}: AIClientProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [, setSessions] = useState<AIChatSession[]>(initialSessions);
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
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const loadedSessionRef = useRef<string | null>(initialActiveSessionId);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement | null>(null);
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

  const showSuggestions = !isStreaming && hasMessages && !!lastAssistantContent;

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isStreaming) {
        abortRef.current?.abort();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isStreaming]);

  useEffect(() => {
    if (composerValue) {
      setInputValue(composerValue);
    }
  }, [composerValue]);

  useEffect(() => {
    autoResize(textareaRef.current);
  }, [inputValue]);

  useEffect(() => {
    autoResize(editTextareaRef.current);
  }, [editValue]);

  useEffect(() => {
    if (initialActiveSessionId === loadedSessionRef.current) return;

    loadedSessionRef.current = initialActiveSessionId;
    setActiveSessionId(initialActiveSessionId);

    if (!initialActiveSessionId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    aiClientService
      .getMessages(initialActiveSessionId)
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
          router.replace("/ai");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [initialActiveSessionId, router]);

  const createNewSession = useCallback(async (): Promise<string> => {
    const session = await aiClientService.createSession({ title: "New Chat" });
    loadedSessionRef.current = session.id;
    setActiveSessionId(session.id);
    setSessions((prev) => [session, ...prev]);
    router.replace(`/ai/${session.id}`);
    return session.id;
  }, [router]);

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

  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      const trimmed = newContent.trim();
      if (!trimmed) return;

      setEditingMessageId(null);
      setEditValue("");

      // Find the original message and all messages after it
      const msgIndex = messages.findIndex((m) => m.id === messageId);
      if (msgIndex === -1) return;

      // Remove this message and all messages after it
      setMessages((prev) => prev.slice(0, msgIndex));

      // Send the edited message
      await handleSend(trimmed);
    },
    [messages, handleSend],
  );

  const handleEditStart = useCallback((id: string, content: string) => {
    setEditingMessageId(id);
    setEditValue(content);
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingMessageId(null);
    setEditValue("");
  }, []);

  const handleNewChat = useCallback(() => {
    loadedSessionRef.current = null;
    setActiveSessionId(null);
    setMessages([]);
    aiComposer.clear();
    setInputValue("");
    setSuggestions([]);
    router.push("/ai");
  }, [router]);

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

  const handleSuggestionClick = useCallback((prompt: string) => {
    handleSend(prompt);
  }, [handleSend]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm ring-1 ring-foreground/5">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="flex items-center justify-between gap-3 border-b bg-card/80 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-card/60">
        <div className="flex items-center gap-3">
          <span className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-hover text-white shadow-sm ring-1 ring-white/20">
            <Sparkles className="size-4.5" />
            {isStreaming && (
              <span className="absolute -right-0.5 -top-0.5 size-3">
                <span className="absolute inset-0 rounded-full bg-success" />
                <span className="absolute inset-0 animate-ping rounded-full bg-success" />
              </span>
            )}
          </span>
          <div>
            <h1 className="text-sm font-semibold leading-tight text-foreground">
              AI Assistant
            </h1>
            <p className="flex items-center gap-1.5 text-[11px] leading-tight text-muted-foreground">
              {isStreaming ? (
                <>
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-success" />
                  </span>
                  Generating response...
                </>
              ) : activeSessionId ? (
                <>
                  <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                  Chat active
                </>
              ) : (
                "Your study companion"
              )}
            </p>
          </div>
        </div>
        <Button
          onClick={handleNewChat}
          size="sm"
          variant="outline"
          className="gap-1.5"
        >
          <Plus className="size-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </Button>
      </header>

      <MessagesArea
        messages={messages}
        dateSeparators={dateSeparators}
        showWelcome={showWelcome}
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        isStreaming={isStreaming}
        reasoningText={reasoningText}
        editingMessageId={editingMessageId}
        editValue={editValue}
        editTextareaRef={editTextareaRef}
        user={session?.user}
        onSend={handleSend}
        onFeedback={handleFeedback}
        onRegenerate={handleRegenerate}
        onSuggestionClick={handleSuggestionClick}
        onEditStart={handleEditStart}
        onEditValueChange={setEditValue}
        onEditSave={handleEditMessage}
        onEditCancel={handleEditCancel}
      />

      {/* ── Composer ──────────────────────────────────────────── */}
      <div className="border-t bg-card/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-card/80">
        {pendingAttachments.length > 0 && (
          <div className="mx-auto mb-2 flex max-w-3xl flex-wrap gap-2">
            {pendingAttachments.map((att) => (
              <div
                key={att.id}
                className="group flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-xs text-foreground transition-all hover:border-brand/30"
              >
                <FileIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate max-w-32">{att.fileName}</span>
                {att.fileSize && (
                  <span className="text-muted-foreground/60 text-[10px]">
                    {Math.round(att.fileSize / 1024)}KB
                  </span>
                )}
                {uploadingFile && att.id === pendingAttachments[pendingAttachments.length - 1]?.id && (
                  <span className="animate-pulse text-muted-foreground text-[10px]">uploading...</span>
                )}
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="ml-0.5 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
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
            variant="outline"
            size="icon"
            className="shrink-0 rounded-xl"
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
              className="scrollbar-thin max-h-48 w-full resize-none rounded-xl border bg-muted/30 px-4 py-3 pr-12 text-sm text-foreground outline-none ring-1 ring-foreground/5 transition-all placeholder:text-muted-foreground/60 focus:border-brand/30 focus:bg-card focus:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <kbd className="pointer-events-none absolute bottom-2.5 right-3 hidden items-center justify-center rounded-md border bg-background px-1.5 text-[10px] font-medium text-muted-foreground/40 sm:flex">
              ↵
            </kbd>
          </div>
          {isStreaming ? (
            <Button
              onClick={handleStop}
              variant="secondary"
              size="icon"
              className="shrink-0 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
              aria-label="Stop generating (Esc)"
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim() && pendingAttachments.length === 0}
              size="icon"
              className="shrink-0 rounded-xl"
              aria-label="Send message"
            >
              <SendHorizonal className="size-4" />
            </Button>
          )}
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground/40">
          <kbd className="inline-flex items-center justify-center rounded border bg-muted/50 px-1 text-[9px] font-medium">Shift</kbd>
          {" + "}
          <kbd className="inline-flex items-center justify-center rounded border bg-muted/50 px-1 text-[9px] font-medium">Enter</kbd>
          {" for new line  ·  "}
          <kbd className="inline-flex items-center justify-center rounded border bg-muted/50 px-1 text-[9px] font-medium">Esc</kbd>
          {" to stop"}
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
      <div className="prose prose-sm max-w-none break-words dark:prose-invert prose-headings:text-foreground prose-headings:font-semibold prose-h3:text-base prose-h4:text-sm prose-p:text-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-strong:font-semibold prose-ul:text-foreground prose-ol:text-foreground prose-li:my-0.5 prose-code:before:content-none prose-code:after:content-none prose-code:rounded prose-code:bg-muted-foreground/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[13px] prose-code:text-foreground prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-muted/60 prose-pre:p-4 prose-pre:text-foreground prose-pre:overflow-x-auto prose-table:border-collapse prose-table:w-full prose-th:bg-muted/60 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-xs prose-th:font-semibold prose-th:text-muted-foreground prose-th:first:rounded-l-lg prose-th:last:rounded-r-lg prose-td:px-3 prose-td:py-2 prose-td:text-sm prose-td:border-b prose-td:border-border/50 prose-tr:last:td:border-b-0 prose-table:text-foreground">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            a: ({ href, children }) => (
              <MessageCitationLink href={href ?? ""} sources={sources}>
                {children}
              </MessageCitationLink>
            ),
            pre: ({ children, ...props }) => {
              const codeEl = Array.isArray(children) ? children[0] : children;
              if (codeEl && typeof codeEl === "object" && "props" in codeEl) {
                const codeProps = (codeEl as Record<string, unknown>).props as Record<string, unknown> | undefined;
                const className = String(codeProps?.className || "");
                const match = /language-(\w+)/.exec(className);
                const language = match ? match[1] : undefined;
                if (language === "json" || language === "jsonc") {
                  const rawChildren = codeProps?.children;
                  const rawCode = Array.isArray(rawChildren)
                    ? (rawChildren as string[]).join("")
                    : String(rawChildren || "");
                  const rendered = detectAndRender(rawCode, language);
                  if (rendered) return rendered;
                }
              }
              return <pre {...props}>{children}</pre>;
            },
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
      className="group flex items-center gap-3 rounded-2xl border-2 border-border/60 bg-card/80 p-4 text-left text-sm font-medium text-foreground shadow-xs ring-1 ring-foreground/[0.03] backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-brand/30 hover:bg-brand/[0.02] hover:shadow-lg hover:shadow-brand/5 active:translate-y-0 active:shadow-sm"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/10 to-brand/5 text-brand ring-1 ring-brand/10 transition-all group-hover:from-brand/15 group-hover:to-brand/10 group-hover:ring-brand/20">
        <Icon className="size-4" />
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
