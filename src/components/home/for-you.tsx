import Link from "next/link";
import {
  BookOpen,
  MessageSquare,
  HelpCircle,
  Users,
  ArrowRight,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { TagPill } from "@/components/ui/tag-pill";

interface RecommendedItem {
  id: string;
  type: "resource" | "discussion" | "question" | "team";
  title: string;
  subtitle?: string;
  meta?: string;
  tags?: string[];
  href: string;
}

interface ForYouProps {
  items: RecommendedItem[];
  error?: boolean;
}

function getIcon(type: RecommendedItem["type"]) {
  switch (type) {
    case "resource": return BookOpen;
    case "discussion": return MessageSquare;
    case "question": return HelpCircle;
    case "team": return Users;
  }
}

function getIconBg(type: RecommendedItem["type"]) {
  switch (type) {
    case "resource": return "bg-violet-500/10 text-violet-500";
    case "discussion": return "bg-amber-500/10 text-amber-500";
    case "question": return "bg-rose-500/10 text-rose-500";
    case "team": return "bg-blue-500/10 text-blue-500";
  }
}

export function ForYou({ items, error }: ForYouProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive flex items-center gap-2">
        <AlertTriangle className="size-4 shrink-0" />
        <span>Failed to load recommendations.</span>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">For You</h2>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-card/50 p-8 text-center">
          <Sparkles className="mx-auto size-6 text-muted-foreground/30" />
          <p className="mt-2 text-xs text-muted-foreground">
            No recommendations yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = getIcon(item.type);
            return (
              <Link
                key={item.id}
                href={item.href}
                className="group flex items-start gap-3 rounded-lg border border-border/40 bg-card p-3 transition-all duration-200 hover:border-primary/20 hover:shadow-sm"
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${getIconBg(item.type)}`}
                >
                  <Icon className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {item.subtitle}
                    </p>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map((tag) => (
                        <TagPill key={tag} name={tag} size="xs" variant="outline" />
                      ))}
                    </div>
                  )}
                </div>
                <ArrowRight className="size-3.5 shrink-0 self-center text-muted-foreground/40 transition-colors group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
