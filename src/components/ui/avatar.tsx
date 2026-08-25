import { getInitials, gradientIndexFromId, AVATAR_GRADIENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AvatarProps {
  /** User id used to pick a deterministic gradient background. */
  id?: string;
  /** Display name — used for initials fallback. */
  name?: string;
  /** Optional avatar image URL. */
  src?: string | null;
  /** Tailwind size classes, e.g. "size-10". */
  className?: string;
}

/**
 * Lightweight avatar with image support and an initials/gradient fallback.
 * Avoids pulling in an extra UI primitive while staying visually consistent.
 */
export function Avatar({ id = "", name = "User", src, className }: AvatarProps) {
  const gradient = AVATAR_GRADIENTS[gradientIndexFromId(id || name)];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br text-sm font-semibold text-white ring-1 ring-foreground/10",
        gradient,
        className ?? "size-10",
      )}
      aria-hidden="true"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="size-full object-cover"
          loading="lazy"
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
