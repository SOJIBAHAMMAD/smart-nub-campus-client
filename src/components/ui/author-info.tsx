import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/components/resources/file-type-utils";

interface AuthorInfoProps {
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
  action?: string;
  timestamp: string;
  size?: "sm" | "md";
  className?: string;
  /** When false, renders the name as plain text instead of a link. */
  linked?: boolean;
}

const avatarSizes = {
  sm: "size-5",
  md: "size-7",
} as const;

const textSizes = {
  sm: "text-xs",
  md: "text-sm",
} as const;

export function AuthorInfo({
  user,
  action,
  timestamp,
  size = "sm",
  className,
  linked = true,
}: AuthorInfoProps) {
  const nameContent = (
    <span
      className={cn(
        "truncate font-medium text-foreground",
        linked && "hover:text-primary transition-colors",
        textSizes[size],
      )}
    >
      {user.name}
    </span>
  );

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Avatar
        id={user.id}
        name={user.name}
        src={user.image}
        className={avatarSizes[size]}
      />
      <div className="flex items-center gap-1 min-w-0">
        {linked ? (
          <Link href={`/profile/${user.id}`}>
            {nameContent}
          </Link>
        ) : (
          nameContent
        )}
        {action && (
          <span className="shrink-0 text-muted-foreground">
            {action}
          </span>
        )}
        <span className="shrink-0 text-muted-foreground text-[11px]">
          {formatRelativeTime(timestamp)}
        </span>
      </div>
    </div>
  );
}
