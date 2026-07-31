import Link from "next/link";
import {
  BookOpen,
  Users,
  Bot,
  MessageSquare,
  HelpCircle,
  UserPlus,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import ROUTES from "@/constants/routes";

const features = [
  {
    title: "Share & Access Resources",
    description:
      "Upload and discover notes, slides, past papers, and assignments across every department. Organised by course code.",
    icon: BookOpen,
    href: ROUTES.RESOURCES,
    className: "md:col-span-1",
    header: (
      <div className="flex h-full items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/15 to-violet-500/5">
        <BookOpen className="size-10 text-violet-500/50" />
      </div>
    ),
  },
  {
    title: "Find Project Teams",
    description:
      "Connect with classmates for group projects, research papers, and study groups. Filter by department and course.",
    icon: Users,
    href: ROUTES.TEAMS,
    className: "md:col-span-1",
    header: (
      <div className="flex h-full items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/15 to-blue-500/5">
        <Users className="size-10 text-blue-500/50" />
      </div>
    ),
  },
  {
    title: "AI Study Assistant",
    description:
      "Upload PDFs, get instant summaries, generate flashcards, create quizzes. Your 24/7 AI tutor for every subject.",
    icon: Bot,
    href: ROUTES.AI,
    className: "md:col-span-1 md:row-span-2",
    header: (
      <div className="flex h-full items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/15 to-purple-500/5">
        <Bot className="size-12 text-purple-500/50" />
      </div>
    ),
  },
  {
    title: "Campus Discussions",
    description:
      "Engage in academic conversations, share insights, stay updated with campus announcements and events.",
    icon: MessageSquare,
    href: ROUTES.DISCUSSIONS,
    className: "md:col-span-1",
    header: (
      <div className="flex h-full items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/15 to-amber-500/5">
        <MessageSquare className="size-10 text-amber-500/50" />
      </div>
    ),
  },
  {
    title: "Q&A Forum",
    description:
      "Stuck on a problem? Ask the community. Help others and build reputation as a subject expert.",
    icon: HelpCircle,
    href: ROUTES.QA,
    className: "md:col-span-1",
    header: (
      <div className="flex h-full items-center justify-center rounded-lg bg-gradient-to-br from-rose-500/15 to-rose-500/5">
        <HelpCircle className="size-10 text-rose-500/50" />
      </div>
    ),
  },
  {
    title: "Build Your Network",
    description:
      "Connect with students across departments. Find study partners, mentors, and build your academic community.",
    icon: UserPlus,
    href: ROUTES.MY_NETWORK,
    className: "md:col-span-1",
    header: (
      <div className="flex h-full items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/15 to-emerald-500/5">
        <UserPlus className="size-10 text-emerald-500/50" />
      </div>
    ),
  },
];

export function ValueBento() {
  return (
    <section className="mx-auto max-w-screen-2xl px-6 py-16 xl:px-8">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <Badge variant="secondary" className="mb-4">
          Why Smart NUB Campus?
        </Badge>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Everything you need to{" "}
          <span className="bg-gradient-to-r from-primary to-[#8b5cf6] bg-clip-text text-transparent">
            excel academically
          </span>
        </h2>
        <p className="mt-3 text-muted-foreground">
          One platform connecting you to study materials, project partners, AI
          tools, and the entire NUB community.
        </p>
      </div>

      <BentoGrid>
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className={feature.className}
          >
            <BentoGridItem
              title={feature.title}
              description={feature.description}
              icon={<feature.icon className="size-5 text-primary" />}
              header={feature.header}
              className="h-full"
              containerClassName="h-full"
              disableTilt={false}
            />
          </Link>
        ))}
      </BentoGrid>

      <Link
        href={ROUTES.RESOURCES}
        className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-gradient-to-r from-primary/[0.04] to-brand/[0.04] px-6 py-5 transition-all duration-200 hover:border-primary/20 hover:shadow-md"
      >
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <GraduationCap className="size-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              Ready to boost your academic life?
            </p>
            <p className="text-sm text-muted-foreground">
              Join 2,500+ NUB students already on the platform
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-1 text-sm font-medium text-primary sm:flex">
          Get Started <ArrowRight className="size-4" />
        </div>
      </Link>
    </section>
  );
}
