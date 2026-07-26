"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users,
  Star,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getProfileCompletenessAction } from "@/actions/connection.actions";
import type { ConnectionOverview } from "@/types";

interface NetworkStrengthProps {
  overview: ConnectionOverview;
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

  return (
    <Card>
      <CardContent className="p-4">
        <CardHeader className="p-0 px-0 pt-0 sm:p-0 sm:px-0 sm:pt-0">
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="size-4 text-primary" />
            Network Strength
          </CardTitle>
        </CardHeader>

        <div className="mt-4 space-y-4">
          <div>
            <Progress value={percentage}>
              <ProgressLabel className="text-xs">Profile Completeness</ProgressLabel>
              <ProgressValue className="text-xs" />
            </Progress>
          </div>

          {missing.length > 0 && (
            <div className="space-y-1.5">
              {missing.slice(0, 4).map((field) => (
                <div
                  key={field}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <AlertCircle className="size-3.5 shrink-0 text-amber-500" />
                  {FIELD_LABELS[field] ?? field}
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <StatItem
              icon={<Users className="size-3.5" />}
              label="Connections"
              value={overview.totalConnections}
              color="text-emerald-500"
            />
            <StatItem
              icon={<Star className="size-3.5" />}
              label="Favorites"
              value={overview.favorites}
              color="text-violet-500"
            />
            <StatItem
              icon={<Shield className="size-3.5" />}
              label="Pending"
              value={overview.pending}
              color="text-amber-500"
            />
            <StatItem
              icon={<CheckCircle2 className="size-3.5" />}
              label="Sent"
              value={overview.sent}
              color="text-sky-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatItem({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-2">
      <span className={cn("shrink-0", color)}>{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground tabular-nums">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
