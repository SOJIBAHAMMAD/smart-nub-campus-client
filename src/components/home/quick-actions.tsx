import Link from "next/link";
import {
  Upload,
  HelpCircle,
  Users,
  MessageSquare,
  BookOpen,
  Bot,
  UserPlus,
  GraduationCap,
} from "lucide-react";
import ROUTES from "@/constants/routes";

const actions = [
  {
    title: "Upload Resource",
    description: "Share notes, slides, or past papers",
    icon: Upload,
    href: ROUTES.RESOURCES,
    gradient: "from-violet-500/15 to-violet-500/5",
    iconColor: "text-violet-500",
    borderHover: "hover:border-violet-500/30",
  },
  {
    title: "Ask a Question",
    description: "Get help from the NUB community",
    icon: HelpCircle,
    href: ROUTES.QA,
    gradient: "from-rose-500/15 to-rose-500/5",
    iconColor: "text-rose-500",
    borderHover: "hover:border-rose-500/30",
  },
  {
    title: "Find Study Team",
    description: "Join or create a project group",
    icon: Users,
    href: ROUTES.TEAMS,
    gradient: "from-blue-500/15 to-blue-500/5",
    iconColor: "text-blue-500",
    borderHover: "hover:border-blue-500/30",
  },
  {
    title: "Start Discussion",
    description: "Kick off an academic conversation",
    icon: MessageSquare,
    href: ROUTES.DISCUSSIONS,
    gradient: "from-amber-500/15 to-amber-500/5",
    iconColor: "text-amber-500",
    borderHover: "hover:border-amber-500/30",
  },
  {
    title: "Browse Resources",
    description: "Discover study materials by course",
    icon: BookOpen,
    href: ROUTES.RESOURCES,
    gradient: "from-emerald-500/15 to-emerald-500/5",
    iconColor: "text-emerald-500",
    borderHover: "hover:border-emerald-500/30",
  },
  {
    title: "AI Study Assistant",
    description: "Summarize, quiz, flashcards & more",
    icon: Bot,
    href: ROUTES.AI,
    gradient: "from-purple-500/15 to-purple-500/5",
    iconColor: "text-purple-500",
    borderHover: "hover:border-purple-500/30",
  },
];

export function QuickActions() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <Link
          href={ROUTES.RESOURCES}
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={`group rounded-xl border border-border/50 bg-card p-4 transition-all duration-200 ${action.borderHover} hover:shadow-sm hover:-translate-y-0.5`}
          >
            <div
              className={`inline-flex rounded-lg bg-gradient-to-br ${action.gradient} p-2.5`}
            >
              <action.icon className={`size-5 ${action.iconColor}`} />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {action.title}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
