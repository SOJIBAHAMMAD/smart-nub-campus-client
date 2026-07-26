"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle, User, FileText, Link2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { ProfileUser } from "@/types/profile.types";

interface ProfileCompletionBannerProps {
  profileData: ProfileUser;
  onDismiss: () => void;
}

interface CompletionItem {
  label: string;
  completed: boolean;
  icon: React.ReactNode;
}

export function ProfileCompletionBanner({
  profileData,
  onDismiss,
}: ProfileCompletionBannerProps) {
  const items: CompletionItem[] = useMemo(() => {
    const p = profileData.profile;
    const s = profileData.student;
    return [
      {
        label: "Add profile photo",
        completed: !!profileData.image,
        icon: <User className="size-3.5" />,
      },
      {
        label: "Write a bio",
        completed: !!p?.bio,
        icon: <FileText className="size-3.5" />,
      },
      {
        label: "Add your skills",
        completed: (profileData.skills?.length ?? 0) > 0,
        icon: <Link2 className="size-3.5" />,
      },
      {
        label: "Add social links",
        completed: !!(p?.githubUrl || p?.linkedinUrl || p?.portfolioUrl || p?.websiteUrl),
        icon: <Link2 className="size-3.5" />,
      },
      {
        label: "Add academic info",
        completed: !!(s?.studentId && s?.department),
        icon: <FileText className="size-3.5" />,
      },
    ];
  }, [profileData]);

  const completedCount = items.filter((i) => i.completed).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  if (percentage >= 100) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold">Complete your profile</h3>
            <span className="text-xs font-medium text-primary">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-1.5 w-full sm:w-64" />
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {items.map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-1 text-xs text-muted-foreground"
              >
                {item.completed ? (
                  <CheckCircle2 className="size-3 text-green-500" />
                ) : (
                  <Circle className="size-3" />
                )}
                {item.label}
              </span>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="size-6 shrink-0 self-start" onClick={onDismiss}>
          <X className="size-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
