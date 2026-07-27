"use client";

import { useState, useEffect, useRef } from "react";
import { Search, UserPlus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { searchPeopleAction } from "@/actions/connection.actions";
import { messageClientService as messageService } from "@/services/message.client.service";
import type { Conversation } from "@/types/message.types";
import type { SearchPerson } from "@/types/connection.types";

interface NewMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  /** Called with the freshly created/found conversation to open it. */
  onStart: (conversation: Conversation) => void;
}

/**
 * Modal to search the user directory and start a new 1:1 conversation.
 * Reuses the people search endpoint, then creates a DIRECT conversation with
 * the selected user.
 */
export function NewMessageModal({
  open,
  onOpenChange,
  currentUserId,
  onStart,
}: NewMessageModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setCreatingId(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchPeopleAction({ query, limit: 20 });
        const data = (res.data as { data?: SearchPerson[] })?.data ?? [];
        setResults(data.filter((p) => p.id !== currentUserId));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open, currentUserId]);

  const handleStart = async (person: SearchPerson) => {
    try {
      const conversation = await messageService.createConversation({
        participantId: person.id,
      });
      toast.success(`Conversation started with ${person.name}`);
      onOpenChange(false);
      onStart(conversation);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start conversation.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
          <DialogDescription>
            Search for a person to start a conversation with.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people by name..."
            className="pl-9"
          />
        </div>

        <div className="max-h-72 min-h-24 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {query ? "No people found." : "Start typing to search."}
            </p>
          ) : (
            <ul className="space-y-1">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => handleStart(p)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted",
                    )}
                  >
                    <Avatar id={p.id} name={p.name} src={p.image} className="size-9" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      {p.student?.department && (
                        <p className="truncate text-xs text-muted-foreground">
                          {p.student.department}
                        </p>
                      )}
                    </div>
                    <UserPlus className="size-4 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
