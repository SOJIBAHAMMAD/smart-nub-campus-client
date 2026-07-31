import { BookOpen, Users, MessageSquare, GraduationCap } from "lucide-react";

const stats = [
  {
    icon: BookOpen,
    value: "500+",
    label: "Study Resources",
    sub: "Notes, slides & past papers",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-500",
  },
  {
    icon: Users,
    value: "48",
    label: "Active Study Groups",
    sub: "Collaborate with peers",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: MessageSquare,
    value: "1,200+",
    label: "Questions Answered",
    sub: "Community powered Q&A",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: GraduationCap,
    value: "2,500+",
    label: "Students Connected",
    sub: "Across all departments",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-500",
  },
];

export function PlatformStats() {
  return (
    <section className="mx-auto max-w-screen-2xl px-6 pt-12 xl:px-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5"
          >
            <div
              className={`absolute -top-8 -right-8 size-16 rounded-full bg-gradient-to-br ${stat.gradient} opacity-60 transition-all duration-300 group-hover:scale-[3] group-hover:opacity-30`}
            />
            <div className="relative">
              <div
                className={`inline-flex rounded-lg bg-gradient-to-br ${stat.gradient} p-2.5`}
              >
                <stat.icon className={`size-5 ${stat.iconColor}`} />
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-foreground">
                {stat.label}
              </p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
