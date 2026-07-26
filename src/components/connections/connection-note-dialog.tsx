"use client";

import { useState, useMemo, useEffect } from "react";
import { Lightbulb, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ConnectionNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    name: string;
    image?: string | null;
    department?: string | null;
    currentSemester?: number | null;
    mutualConnections?: number;
  };
  onSend: (note?: string) => void;
  busy: boolean;
}

const MAX_CHARS = 300;

function buildSuggestions(user: ConnectionNoteDialogProps["user"]): {
  label: string;
  text: string;
}[] {
  const firstName = user.name.split(" ")[0];
  const suggestions: { label: string; text: string }[] = [];

  if (user.mutualConnections && user.mutualConnections > 0) {
    suggestions.push({
      label: "Mutual connection",
      text: `Hi ${firstName}, I noticed we have ${user.mutualConnections} mutual connection${user.mutualConnections === 1 ? "" : "s"}. I'd love to connect!`,
    });
  }

  if (user.department) {
    suggestions.push({
      label: `Same department (${user.department})`,
      text: `Hi ${firstName}, I see you're also in ${user.department}. Let's connect and share notes!`,
    });
  }

  if (user.currentSemester) {
    suggestions.push({
      label: "Fellow student",
      text: `Hey ${firstName}, I'm a fellow student at NUB. Would be great to connect!`,
    });
  }

  suggestions.push({
    label: "Campus connect",
    text: `Hi ${firstName}, I'd like to connect with you on campus!`,
  });

  return suggestions;
}

export function ConnectionNoteDialog({
  open,
  onOpenChange,
  user,
  onSend,
  busy,
}: ConnectionNoteDialogProps) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) setNote("");
  }, [open]);

  const suggestions = useMemo(() => buildSuggestions(user), [user]);

  const handleSend = () => {
    const trimmed = note.trim();
    onSend(trimmed || undefined);
  };

  const handleSendWithout = () => {
    onSend(undefined);
  };

  const handleSuggestionClick = (text: string) => {
    setNote(text);
  };

  const dept = user.department ?? "NUB";
  const semester = user.currentSemester
    ? `Semester ${user.currentSemester}`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold">
              Add a note
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Stand out by adding a note to {user.name.split(" ")[0]}.
          </p>
        </DialogHeader>

        <div className="px-5 pt-4">
          <div className="flex items-center gap-3">
            <Avatar
              id={user.id}
              name={user.name}
              src={user.image}
              className="size-12"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {[dept, semester].filter(Boolean).join(" · ")}
              </p>
              {user.mutualConnections && user.mutualConnections > 0 && (
                <p className="text-xs text-muted-foreground">
                  {user.mutualConnections} mutual connection
                  {user.mutualConnections === 1 ? "" : "s"}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3 px-5 pt-4">
          <div className="relative">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, MAX_CHARS))}
              maxLength={MAX_CHARS}
              rows={4}
              placeholder="What do you have in common?"
              className="resize-none rounded-xl border-border/60 bg-muted/30 text-sm placeholder:text-muted-foreground/60"
            />
            <span
              className={cn(
                "absolute bottom-2.5 right-3 text-[10px] tabular-nums",
                note.length > MAX_CHARS * 0.9
                  ? "text-destructive"
                  : "text-muted-foreground/50",
              )}
            >
              {note.length}/{MAX_CHARS}
            </span>
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Lightbulb className="size-3.5" />
                Try a suggestion
              </p>
              <div className="space-y-1.5">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestionClick(s.text)}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2 text-left text-xs transition-all hover:border-border hover:bg-muted/50",
                      note === s.text
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/40",
                    )}
                  >
                    <span className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                      {s.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-foreground/80 line-clamp-2">
                      {s.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSendWithout}
            disabled={busy}
            className="text-muted-foreground"
          >
            Without a note
          </Button>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={busy}
            className="px-4"
          >
            {busy ? "Sending..." : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
