import Link from "next/link";
import {
  BookOpen,
  Users,
  UserPlus,
  MessageSquare,
  HelpCircle,
  Bot,
} from "lucide-react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import ROUTES from "@/constants/routes";

const features = [
  {
    title: "Resources",
    description: "Browse notes, slides, and past papers shared by peers.",
    icon: BookOpen,
    href: ROUTES.RESOURCES,
    header: (
      <div className="flex h-full items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/10 to-violet-500/5">
        <BookOpen className="size-10 text-violet-500/40" />
      </div>
    ),
  },
  {
    title: "Study Teams",
    description: "Find teammates for projects, labs, and research.",
    icon: Users,
    href: ROUTES.TEAMS,
    header: (
      <div className="flex h-full items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5">
        <Users className="size-10 text-blue-500/40" />
      </div>
    ),
  },
  {
    title: "My Network",
    description: "Connect with classmates across departments.",
    icon: UserPlus,
    href: ROUTES.MY_NETWORK,
    header: (
      <div className="flex h-full items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
        <UserPlus className="size-10 text-emerald-500/40" />
      </div>
    ),
  },
  {
    title: "Discussions",
    description: "Join academic and campus conversations.",
    icon: MessageSquare,
    href: ROUTES.DISCUSSIONS,
    header: (
      <div className="flex h-full items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5">
        <MessageSquare className="size-10 text-amber-500/40" />
      </div>
    ),
  },
  {
    title: "Q&A",
    description: "Ask questions and help fellow students.",
    icon: HelpCircle,
    href: ROUTES.QA,
    header: (
      <div className="flex h-full items-center justify-center rounded-lg bg-gradient-to-br from-rose-500/10 to-rose-500/5">
        <HelpCircle className="size-10 text-rose-500/40" />
      </div>
    ),
  },
  {
    title: "AI Assistant",
    description: "Get instant help with studies and campus info.",
    icon: Bot,
    href: ROUTES.AI,
    header: (
      <div className="flex h-full items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5">
        <Bot className="size-10 text-purple-500/40" />
      </div>
    ),
  },
];

export function FeatureCards() {
  return (
    <section className="mx-auto max-w-screen-2xl px-6 py-12 xl:px-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Platform Features
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you need for your academic journey
        </p>
      </div>
      <BentoGrid>
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href} className="contents">
            <BentoGridItem
              title={feature.title}
              description={feature.description}
              icon={<feature.icon className="size-5 text-primary" />}
              header={feature.header}
              className="cursor-pointer transition-all duration-200 hover:border-primary/30 hover:shadow-md"
              containerClassName="md:col-span-1"
            />
          </Link>
        ))}
      </BentoGrid>
    </section>
  );
}
