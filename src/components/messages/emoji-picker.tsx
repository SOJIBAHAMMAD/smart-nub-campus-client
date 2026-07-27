"use client";

import { useState } from "react";
import { EmojiPicker } from "frimousse";
import { SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EmojiPickerPopoverProps {
  onSelect: (emoji: string) => void;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

export function EmojiPickerPopover({
  onSelect,
  className,
  side = "top",
}: EmojiPickerPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Add emoji"
            className="size-8"
          />
        }
      >
        <SmilePlus className="size-4" />
      </PopoverTrigger>
      <PopoverContent
        side={side}
        sideOffset={8}
        align="end"
        className={cn("w-fit p-0", className)}
      >
        <EmojiPicker.Root
          className="isolate flex h-[326px] w-fit flex-col"
          onEmojiSelect={({ emoji }: { emoji: string }) => {
            onSelect(emoji);
            setOpen(false);
          }}
        >
          <EmojiPicker.Search className="z-10 mx-2 mt-2 appearance-none rounded-md bg-muted px-2.5 py-2 text-sm outline-hidden" />
          <EmojiPicker.Viewport className="relative flex-1 outline-hidden">
            <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              Loading…
            </EmojiPicker.Loading>
            <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              No emoji found.
            </EmojiPicker.Empty>
            <EmojiPicker.List
              className="select-none pb-1.5"
              components={{
                CategoryHeader: ({ category, ...props }: { category: { label: string }; [key: string]: unknown }) => (
                  <div
                    className="bg-background px-3 pt-3 pb-1.5 text-xs font-medium text-muted-foreground"
                    {...props}
                  >
                    {category.label}
                  </div>
                ),
                Row: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
                  <div className="scroll-my-1.5 px-1.5" {...props}>
                    {children}
                  </div>
                ),
                Emoji: ({ emoji, ...props }: { emoji: { emoji: string }; [key: string]: unknown }) => (
                  <button
                    className="flex size-8 items-center justify-center rounded-md text-lg data-[active]:bg-muted"
                    {...props}
                  >
                    {emoji.emoji}
                  </button>
                ),
              }}
            />
          </EmojiPicker.Viewport>
        </EmojiPicker.Root>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Compact emoji picker for quick reactions (shown on hover over a message).
 * Renders a simple row of common reaction emojis.
 */
interface QuickReactionPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "👏"];

export function QuickReactionPicker({
  onSelect,
  className,
}: QuickReactionPickerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-full border bg-background px-1.5 py-1 shadow-md",
        className,
      )}
      role="group"
      aria-label="Quick reactions"
    >
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(emoji);
          }}
          className="flex size-7 items-center justify-center rounded-full text-base transition-colors hover:bg-muted"
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

/**
 * Reaction bar showing grouped reactions below a message.
 */
interface MessageReactionBarProps {
  reactions: { userId: string; emoji: string }[];
  currentUserId: string;
  onToggleReaction: (emoji: string) => void;
}

export function MessageReactionBar({
  reactions,
  currentUserId,
  onToggleReaction,
}: MessageReactionBarProps) {
  if (!reactions || reactions.length === 0) return null;

  const grouped = reactions.reduce<Record<string, { count: number; hasOwn: boolean }>>(
    (acc, r) => {
      if (!acc[r.emoji]) acc[r.emoji] = { count: 0, hasOwn: false };
      acc[r.emoji].count++;
      if (r.userId === currentUserId) acc[r.emoji].hasOwn = true;
      return acc;
    },
    {},
  );

  return (
    <div className="mt-1 flex flex-wrap gap-1" role="group" aria-label="Message reactions">
      {Object.entries(grouped).map(([emoji, { count, hasOwn }]) => (
        <button
          key={emoji}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleReaction(emoji);
          }}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs transition-colors",
            hasOwn
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border bg-muted/50 text-muted-foreground hover:bg-muted",
          )}
          aria-label={`${emoji} reaction, ${count} ${count === 1 ? "person" : "people"}${hasOwn ? ", including you" : ""}`}
        >
          <span className="text-sm">{emoji}</span>
          {count > 1 && <span className="font-medium">{count}</span>}
        </button>
      ))}
    </div>
  );
}
