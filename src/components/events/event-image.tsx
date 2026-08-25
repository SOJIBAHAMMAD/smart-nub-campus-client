"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AVATAR_GRADIENTS, gradientIndexFromId } from "@/lib/constants";

interface EventImageProps {
  id: string;
  title: string;
  src?: string | null;
  className?: string;
  imgClassName?: string;
  iconClassName?: string;
  aspect?: string;
}

/**
 * Event cover image with a deterministic gradient fallback.
 * Shows a branded placeholder whenever the event has no image or the
 * image URL fails to load, so cards never render a broken-image icon.
 */
export function EventImage({
  id,
  title,
  src,
  className,
  imgClassName,
  iconClassName,
  aspect = "aspect-[16/10]",
}: EventImageProps) {
  const [failed, setFailed] = useState(false);
  const gradient = AVATAR_GRADIENTS[gradientIndexFromId(id || title)];

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={title}
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
          gradient,
          aspect,
          className,
        )}
      >
        <div className="absolute -right-8 -top-10 size-32 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-12 -left-8 size-36 rounded-full bg-black/10 blur-3xl" />
        <CalendarClock
          className={cn("size-9 text-white/85 drop-shadow-sm", iconClassName)}
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-muted", aspect, className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={title}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn("size-full object-cover", imgClassName)}
      />
    </div>
  );
}
