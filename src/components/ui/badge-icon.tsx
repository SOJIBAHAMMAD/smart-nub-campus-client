import {
  UploadCloud,
  FolderUp,
  LibraryBig,
  BookMarked,
  MessageSquare,
  MessagesSquare,
  BadgeCheck,
  Lightbulb,
  HelpCircle,
  BookOpen,
  GraduationCap,
  Star,
  Megaphone,
  Trophy,
  Gem,
  UserPlus,
  UserRoundCheck,
  Rocket,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BadgeTier } from "@/types/gamification.types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "upload-cloud": UploadCloud,
  "folder-up": FolderUp,
  "library-big": LibraryBig,
  "book-marked": BookMarked,
  "message-square": MessageSquare,
  "messages-square": MessagesSquare,
  "badge-check": BadgeCheck,
  lightbulb: Lightbulb,
  "help-circle": HelpCircle,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  star: Star,
  megaphone: Megaphone,
  trophy: Trophy,
  gem: Gem,
  "user-plus": UserPlus,
  "user-round-check": UserRoundCheck,
  rocket: Rocket,
};

interface TierStyle {
  bg: string;
  ring: string;
  icon: string;
  shadow: string;
}

const TIER_STYLES: Record<BadgeTier, TierStyle> = {
  BRONZE: {
    bg: "bg-gradient-to-br from-amber-200/50 via-amber-600/15 to-amber-800/40 dark:from-amber-500/25 dark:via-amber-600/10 dark:to-amber-900/40",
    ring: "ring-amber-600/40 dark:ring-amber-500/40",
    icon: "text-amber-700 dark:text-amber-400",
    shadow: "shadow-[0_2px_8px_rgba(180,83,9,0.25)]",
  },
  SILVER: {
    bg: "bg-gradient-to-br from-slate-200/60 via-slate-400/15 to-slate-600/30 dark:from-slate-300/25 dark:via-slate-400/10 dark:to-slate-700/40",
    ring: "ring-slate-400/40 dark:ring-slate-400/40",
    icon: "text-slate-600 dark:text-slate-300",
    shadow: "shadow-[0_2px_8px_rgba(100,116,139,0.25)]",
  },
  GOLD: {
    bg: "bg-gradient-to-br from-yellow-200/60 via-amber-500/20 to-yellow-600/40 dark:from-yellow-400/30 dark:via-amber-500/15 dark:to-yellow-700/40",
    ring: "ring-yellow-500/40 dark:ring-yellow-400/50",
    icon: "text-yellow-600 dark:text-yellow-400",
    shadow: "shadow-[0_2px_10px_rgba(234,179,8,0.35)]",
  },
  PLATINUM: {
    bg: "bg-gradient-to-br from-violet-200/60 via-purple-500/20 to-fuchsia-600/40 dark:from-violet-400/30 dark:via-purple-500/15 dark:to-fuchsia-700/40",
    ring: "ring-purple-500/40 dark:ring-purple-400/50",
    icon: "text-purple-600 dark:text-purple-300",
    shadow: "shadow-[0_2px_10px_rgba(168,85,247,0.35)]",
  },
};

const SIZE_STYLES = {
  sm: {
    container: "size-8 rounded-lg",
    icon: "size-4",
    inner: "rounded-[7px]",
  },
  md: {
    container: "size-11 rounded-xl",
    icon: "size-5",
    inner: "rounded-[10px]",
  },
  lg: {
    container: "size-14 rounded-2xl",
    icon: "size-6",
    inner: "rounded-[14px]",
  },
} as const;

interface BadgeIconProps {
  icon?: string | null;
  tier: BadgeTier;
  size?: keyof typeof SIZE_STYLES;
  className?: string;
}

/**
 * Tier-styled badge medallion. Maps stored lucide icon names (kebab-case)
 * from the Badge.icon column to rendered lucide-react icons with a
 * bronze/silver/gold/platinum visual treatment. Falls back to a star
 * emblem when the icon name is unknown or unset.
 */
export function BadgeIcon({
  icon,
  tier,
  size = "md",
  className,
}: BadgeIconProps) {
  const tierStyle = TIER_STYLES[tier] ?? TIER_STYLES.BRONZE;
  const sizeStyle = SIZE_STYLES[size];
  const Icon = (icon && ICON_MAP[icon]) || Award;

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center ring-1",
        sizeStyle.container,
        tierStyle.bg,
        tierStyle.ring,
        tierStyle.shadow,
        className,
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          "absolute inset-[3px] bg-gradient-to-b from-background/40 to-transparent",
          sizeStyle.inner,
        )}
      />
      <Icon className={cn("relative", sizeStyle.icon, tierStyle.icon)} />
    </div>
  );
}
