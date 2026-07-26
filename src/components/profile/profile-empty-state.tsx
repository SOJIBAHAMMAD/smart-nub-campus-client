"use client";

import { useMemo, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  User,
  FileText,
  Link2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ProfileUser } from "@/types/profile.types";

interface ProfileEmptyStateProps {
  profileData: ProfileUser;
  onDismiss: () => void;
}

interface CompletionStep {
  label: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
  scrollTo?: string;
  href?: string;
}

export function ProfileEmptyState({
  profileData,
  onDismiss,
}: ProfileEmptyStateProps) {
  const steps: CompletionStep[] = useMemo(() => {
    const p = profileData.profile;
    const s = profileData.student;
    return [
      {
        label: "Add a profile photo",
        description: "Help others recognize you",
        completed: !!profileData.image,
        icon: <User className="size-4" />,
        scrollTo: "section-photo",
      },
      {
        label: "Write a bio",
        description: "Tell the campus about yourself",
        completed: !!p?.bio,
        icon: <FileText className="size-4" />,
        scrollTo: "section-bio",
      },
      {
        label: "Add your skills",
        description: "Showcase your expertise",
        completed: (profileData.skills?.length ?? 0) > 0,
        icon: <Sparkles className="size-4" />,
        scrollTo: "section-skills",
      },
      {
        label: "Add social links",
        description: "Connect your online presence",
        completed: !!(
          p?.githubUrl ||
          p?.linkedinUrl ||
          p?.portfolioUrl ||
          p?.websiteUrl
        ),
        icon: <Link2 className="size-4" />,
        scrollTo: "section-links",
      },
      {
        label: "Add academic info",
        description: "Share your department & batch",
        completed: !!(s?.studentId && s?.department),
        icon: <GraduationCap className="size-4" />,
        href: "/settings/profile",
      },
    ];
  }, [profileData]);

  const completedCount = steps.filter((s) => s.completed).length;
  const percentage = Math.round((completedCount / steps.length) * 100);

  const scrollToSection = useCallback((id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  if (percentage >= 100) return null;

  return (
    <Card className="border-primary/15 bg-gradient-to-br from-primary/[0.03] to-transparent">
      <CardContent className="p-5 sm:p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">
                Welcome, {profileData.name.split(" ")[0]}!
              </h3>
              <p className="text-xs text-muted-foreground">
                Complete your profile to get the most out of campus.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-4 flex items-center gap-3">
          <Progress value={percentage} className="h-1.5 flex-1" />
          <span className="text-xs font-medium tabular-nums text-primary">
            {percentage}%
          </span>
        </div>

        {/* Steps grid */}
        <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => {
            const content = (
              <>
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                    step.completed
                      ? "bg-green-500/10 text-green-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-medium ${
                      step.completed
                        ? "text-green-600 line-through opacity-70"
                        : ""
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </>
            );

            const baseClass = `group flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-all ${
              step.completed
                ? "border-green-500/20 bg-green-500/[0.03]"
                : "border-border/60 hover:border-primary/30 hover:bg-primary/[0.03]"
            }`;

            if (step.scrollTo && !step.completed) {
              return (
                <button
                  key={step.label}
                  type="button"
                  onClick={() => scrollToSection(step.scrollTo!)}
                  className={`${baseClass} text-left w-full`}
                >
                  {content}
                </button>
              );
            }

            if (step.href && !step.completed) {
              return (
                <Link key={step.label} href={step.href} className={baseClass}>
                  {content}
                </Link>
              );
            }

            return (
              <div key={step.label} className={baseClass}>
                {content}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <Link
          href="/settings/profile"
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          Manage Visibility
          <ArrowRight className="size-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
