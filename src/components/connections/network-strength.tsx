"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Users,
  Star,
  Shield,
  CheckCircle2,
} from "lucide-react";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getProfileCompletenessAction } from "@/actions/connection.actions";
import type { ConnectionOverview } from "@/types";

interface NetworkStrengthProps {
  overview?: ConnectionOverview;
}

interface CompletenessData {
  percentage: number;
  missingFields: string[];
}

const FIELD_LABELS: Record<string, string> = {
  bio: "Add a bio",
  avatar: "Upload a profile photo",
  department: "Set your department",
  semester: "Set your semester",
  skills: "Add skills",
  interests: "Add interests",
  socialLinks: "Add social links",
  phone: "Add phone number",
  studentId: "Verify student ID",
};

export function NetworkStrength({ overview }: NetworkStrengthProps) {
  const [completeness, setCompleteness] = useState<CompletenessData | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await getProfileCompletenessAction();
        if (res.success && res.data) {
          setCompleteness(res.data as CompletenessData);
        }
      } catch {
        /* non-critical */
      }
    })();
  }, []);

  const percentage = completeness?.percentage ?? 0;
  const missing = completeness?.missingFields ?? [];
  const stats = overview ?? { totalConnections: 0, favorites: 0, pending: 0, sent: 0 };

  return (
    <div className="space-y-4">
      <div>
        <Progress value={percentage}>
          <ProgressLabel className="text-xs">Profile Completeness</ProgressLabel>
          <ProgressValue className="text-xs" />
        </Progress>
      </div>

      {missing.length > 0 && (
        <div className="space-y-1.5">
          {missing.slice(0, 3).map((field) => (
            <div
              key={field}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <AlertCircle className="size-3.5 shrink-0 text-amber-500" />
              <span className="truncate">{FIELD_LABELS[field] ?? field}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <StatItem
          icon={<Users className="size-3.5" />}
          label="Connections"
          value={stats.totalConnections}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <StatItem
          icon={<Star className="size-3.5" />}
          label="Favorites"
          value={stats.favorites}
          color="text-violet-500"
          bg="bg-violet-500/10"
        />
        <StatItem
          icon={<Shield className="size-3.5" />}
          label="Pending"
          value={stats.pending}
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <StatItem
          icon={<CheckCircle2 className="size-3.5" />}
          label="Sent"
          value={stats.sent}
          color="text-sky-500"
          bg="bg-sky-500/10"
        />
      </div>
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-2 transition-colors hover:bg-muted/80">
      <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-md", bg, color)}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground tabular-nums">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
