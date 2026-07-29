import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  /** Names of the users currently typing (excluding the current user). */
  names?: string[];
  className?: string;
}

/**
 * Three animated dots shown in the chat thread (and optionally in a
 * conversation preview) to indicate that someone is composing a message.
 * Uses smooth CSS animations for a polished feel.
 */
export function TypingIndicator({ names, className }: TypingIndicatorProps) {
  const label = names && names.length > 0
    ? `${names.join(", ")} ${names.length === 1 ? "is" : "are"} typing`
    : "typing";

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} aria-label={label}>
      <span className="inline-flex items-center gap-[3px] rounded-full bg-muted/80 px-2.5 py-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block size-[5px] rounded-full bg-muted-foreground/50"
            style={{
              animation: `typing-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </span>
    </span>
  );
}
