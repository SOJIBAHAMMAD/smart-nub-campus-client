import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    n: 1,
    title: "Browse mentors",
    desc: "Filter alumni by department or topic to find a good fit.",
  },
  {
    n: 2,
    title: "Send a request",
    desc: "Pick up to 5 goals you want to work on together.",
  },
  {
    n: 3,
    title: "Track progress",
    desc: "Once accepted, manage the relationship in My mentorships.",
  },
];

const REQUEST_STATUSES = [
  { name: "Pending", desc: "Waiting on the mentor to respond." },
  { name: "Accepted", desc: "The mentorship is now active." },
  { name: "Rejected", desc: "The mentor declined this request." },
  { name: "Withdrawn", desc: "You cancelled the request." },
];

const RELATIONSHIP_STATUSES = [
  { name: "Active", desc: "You are actively working together." },
  { name: "Completed", desc: "The mentorship has concluded." },
  { name: "Ended", desc: "The relationship was closed." },
];

interface MentorshipGuideSidebarProps {
  kind: "requests" | "relationships";
}

export function MentorshipGuideSidebar({
  kind,
}: MentorshipGuideSidebarProps) {
  const statuses =
    kind === "requests" ? REQUEST_STATUSES : RELATIONSHIP_STATUSES;

  return (
    <div className="space-y-4">
      <Card size="sm">
        <CardHeader>
          <CardTitle>Mentorship program</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 text-xs leading-relaxed text-muted-foreground sm:px-5 sm:pb-5">
          Free, 1-on-1 career guidance from NUB alumni. Each relationship is
          goal-based so both sides stay focused on what matters.
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 px-4 pb-4 sm:px-5 sm:pb-5">
          {STEPS.map((step) => (
            <div key={step.n} className="flex gap-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {step.n}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground">
                  {step.title}
                </p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Statuses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pb-4 sm:px-5 sm:pb-5">
          {statuses.map((status) => (
            <div key={status.name} className="flex items-baseline justify-between gap-3">
              <span className="shrink-0 text-xs font-medium text-foreground">
                {status.name}
              </span>
              <span className="text-right text-[11px] leading-relaxed text-muted-foreground">
                {status.desc}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
