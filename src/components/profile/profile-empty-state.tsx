"use client";

import Link from "next/link";
import { Sparkles, User, FileText, Link2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileEmptyStateProps {
  profileData: {
    id: string;
    name: string;
    image: string | null;
  };
}

export function ProfileEmptyState({ profileData }: ProfileEmptyStateProps) {
  const steps = [
    {
      icon: <User className="size-5" />,
      title: "Add a profile photo",
      description: "Help others recognize you",
      href: "/settings/profile",
    },
    {
      icon: <FileText className="size-5" />,
      title: "Write a bio",
      description: "Tell the campus about yourself",
      href: "/settings/profile",
    },
    {
      icon: <Link2 className="size-5" />,
      title: "Add your skills",
      description: "Showcase your expertise",
      href: "/settings/profile",
    },
  ];

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center py-12 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="size-8 text-primary" />
        </div>
        <h2 className="mb-1 text-lg font-semibold">Welcome, {profileData.name.split(" ")[0]}!</h2>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          Complete your profile to connect with classmates, share resources, and get the most out of Smart NUB Campus.
        </p>

        <div className="mb-6 w-full max-w-sm space-y-3">
          {steps.map((step) => (
            <Link
              key={step.title}
              href={step.href}
              className="flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                {step.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </div>

        <Link
          href="/settings/profile"
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Complete Your Profile
        </Link>
      </CardContent>
    </Card>
  );
}
