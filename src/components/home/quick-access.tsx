import Link from "next/link";
import {
  BookOpen,
  Users,
  UserPlus,
  MessageSquare,
  HelpCircle,
  Bot,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const shortcuts = [
  { label: "Resources", icon: BookOpen, href: "/resources" },
  { label: "Teams", icon: Users, href: "/teams" },
  { label: "My Network", icon: UserPlus, href: "/my-network" },
  { label: "Discussions", icon: MessageSquare, href: "/discussions" },
  { label: "Q&A", icon: HelpCircle, href: "/qa" },
  { label: "AI Assistant", icon: Bot, href: "/ai" },
] as const;

/** Horizontal row of shortcut cards linking to main platform features. */
export function QuickAccess() {
  return (
    <section className="mx-auto max-w-360 px-4 py-8 sm:px-6">
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
        {shortcuts.map(({ label, icon: Icon, href }) => (
          <Card key={href} interactive className="min-w-[120px]">
            <Link href={href} className="contents">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <Icon className="size-6 text-primary" />
                <span className="text-sm font-medium">{label}</span>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
