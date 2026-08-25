"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Users, Loader2, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import { searchPeopleAction } from "@/actions/connection.actions";
import type { SearchPerson } from "@/types/connection.types";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  /** Called with the freshly created group conversation. */
  onCreated: (conversation: unknown) => void;
  /** Client service call injected to avoid a direct server-service import. */
  createGroup: (data: {
    name: string;
    participantIds: string[];
    description?: string;
  }) => Promise<unknown>;
}

/**
 * Modal to create a group conversation: search people, multi-select members,
 * name the group, then submit. Reuses the people-search endpoint.
 */
export function CreateGroupModal({
  open,
  onOpenChange,
  currentUserId,
  onCreated,
  createGroup,
}: CreateGroupModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchPerson[]>([]);
  const [selected, setSelected] = useState<SearchPerson[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSelected([]);
      setName("");
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchPeopleAction({ query: query || undefined, limit: 20 });
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

  const toggleSelect = (person: SearchPerson) => {
    setSelected((prev) =>
      prev.some((p) => p.id === person.id)
        ? prev.filter((p) => p.id !== person.id)
        : [...prev, person],
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a group name.");
      return;
    }
    if (selected.length === 0) {
      toast.error("Please add at least one member.");
      return;
    }
    setSubmitting(true);
    try {
      const conversation = await createGroup({
        name: name.trim(),
        participantIds: selected.map((p) => p.id),
      });
      toast.success(`Group "${name.trim()}" created`);
      onOpenChange(false);
      onCreated(conversation);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create group.");
    } finally {
      setSubmitting(false);
    }
  };

  const available = results.filter((p) => !selected.some((s) => s.id === p.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New group</DialogTitle>
          <DialogDescription>
            Give the group a name and add members.
          </DialogDescription>
        </DialogHeader>

        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
          className="mt-1"
        />

        {/* Selected members */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((p) => (
              <span
                key={p.id}
                className="flex items-center gap-1 rounded-full bg-primary/10 py-1 pr-1.5 pl-2 text-xs font-medium text-primary"
              >
                {p.name}
                <button
                  type="button"
                  onClick={() => toggleSelect(p)}
                  className="rounded-full p-0.5 hover:bg-primary/20"
                  aria-label={`Remove ${p.name}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Add members..."
            className="pl-9"
          />
        </div>

        {/* Results */}
        <div className="max-h-60 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : available.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {query ? "No people found." : "No more people to add."}
            </p>
          ) : (
            <ul className="space-y-1">
              {available.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => toggleSelect(p)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted"
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
                    <Users className="size-4 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={submitting || !name.trim() || selected.length === 0}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Create group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
