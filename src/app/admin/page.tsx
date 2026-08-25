"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { StatsCard, type StatsCardTone } from "@/components/admin/stats-card";
import { AdminChart } from "@/components/admin/admin-chart";
import { RecentActivity } from "@/components/admin/recent-activity";
import { DashboardHeader } from "@/components/admin/dashboard/dashboard-header";
import {
  DashboardSkeleton,
  DashboardChartsSkeleton,
} from "@/components/admin/dashboard/dashboard-skeleton";
import { DashboardError } from "@/components/admin/dashboard/dashboard-error";
import { adminService } from "@/services/admin.service";
import {
  Users,
  Activity,
  UserPlus,
  BookOpen,
  Download,
  MessageSquare,
  HelpCircle,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import type {
  AdminDashboardStats,
  AdminDashboardCharts,
  AuditLogEntry,
} from "@/types/admin.types";
import { toast } from "sonner";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Format a YYYY-MM-DD string to a short label like "Jul 17". */
function formatChartDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMM d");
  } catch {
    return dateStr;
  }
}

/** Map audit log action to RecentActivity action type. */
function mapAuditAction(
  action: string,
): "USER_SIGNED_UP" | "RESOURCE_UPLOADED" | "VERIFICATION_SUBMITTED" | "DISCUSSION_CREATED" | "QUESTION_ASKED" | null {
  if (action.includes("USER") || action === "CREATE_USER") return "USER_SIGNED_UP";
  if (action.includes("RESOURCE") && (action.includes("CREATE") || action.includes("UPLOAD"))) return "RESOURCE_UPLOADED";
  if (action.includes("VERIFICATION")) return "VERIFICATION_SUBMITTED";
  if (action.includes("DISCUSSION")) return "DISCUSSION_CREATED";
  if (action.includes("QUESTION")) return "QUESTION_ASKED";
  if (action === "VIEW_DASHBOARD") return "USER_SIGNED_UP";
  if (action.includes("VERIFY_RESOURCE")) return "RESOURCE_UPLOADED";
  return null;
}

/** Map audit log entry to a RecentActivity-compatible entry. */
function auditToActivity(log: AuditLogEntry) {
  const action = mapAuditAction(log.action);
  return {
    id: log.id,
    userName: log.user?.name ?? "System",
    action: action ?? "USER_SIGNED_UP" as const,
    details: log.details
      ? Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(", ")
      : `${log.action.replace(/_/g, " ").toLowerCase()}`,
    timestamp: log.createdAt,
  };
}

/** Truncate long x-axis labels (e.g. department names). */
function truncateLabel(value: string): string {
  return value.length > 16 ? `${value.slice(0, 15)}…` : value;
}

// ── Page Component ───────────────────────────────────────────────────────────

interface KpiCard {
  label: string;
  value?: number;
  icon: LucideIcon;
  tone: StatsCardTone;
  isWarning?: boolean;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [charts, setCharts] = useState<AdminDashboardCharts | null>(null);
  const [recentActivity, setRecentActivity] = useState<ReturnType<typeof auditToActivity>[]>([]);
  const [period, setPeriod] = useState(7);

  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [isRefreshingCharts, setIsRefreshingCharts] = useState(false);

  const [statsError, setStatsError] = useState(false);
  const [chartsError, setChartsError] = useState(false);
  const [activityError, setActivityError] = useState(false);

  const chartsMounted = useRef(false);

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    setStatsError(false);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch {
      setStatsError(true);
      toast.error("Failed to load dashboard stats");
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const fetchCharts = useCallback(async (days: number, isInitial: boolean) => {
    if (isInitial) {
      setIsLoadingCharts(true);
    } else {
      setIsRefreshingCharts(true);
    }
    setChartsError(false);
    try {
      const data = await adminService.getDashboardCharts(days);
      setCharts(data);
    } catch {
      setChartsError(true);
      toast.error("Failed to load chart data");
    } finally {
      setIsLoadingCharts(false);
      setIsRefreshingCharts(false);
    }
  }, []);

  const fetchActivity = useCallback(async () => {
    setIsLoadingActivity(true);
    setActivityError(false);
    try {
      const result = await adminService.listAuditLogs({ page: 1, limit: 10 });
      setRecentActivity(result.data.map(auditToActivity));
    } catch {
      setActivityError(true);
      toast.error("Failed to load recent activity");
    } finally {
      setIsLoadingActivity(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const isInitial = !chartsMounted.current;
    chartsMounted.current = true;
    fetchCharts(period, isInitial);
  }, [period, fetchCharts]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const retryStats = () => fetchStats();
  const retryCharts = () => fetchCharts(period, false);
  const retryActivity = () => fetchActivity();

  const isInitialLoading = isLoadingStats || isLoadingCharts || isLoadingActivity;

  // Transform chart buckets into recharts-compatible format
  const registrationData = (charts?.userRegistrations ?? []).map((b) => ({
    name: formatChartDate(b.date),
    users: b.count,
  }));

  const resourceData = (charts?.resourceUploads ?? []).map((b) => ({
    name: formatChartDate(b.date),
    uploads: b.count,
  }));

  const departmentData = (charts?.departmentDistribution ?? []).map((b) => ({
    name: b.department,
    count: b.count,
  }));

  const verificationData = (charts?.verificationTrends ?? []).map((b) => ({
    name: `Week of ${formatChartDate(b.date)}`,
    count: b.count,
  }));

  const kpiCards: KpiCard[] = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, tone: "primary" },
    { label: "Total Resources", value: stats?.totalResources, icon: BookOpen, tone: "blue" },
    { label: "Total Discussions", value: stats?.totalDiscussions, icon: MessageSquare, tone: "violet" },
    { label: "Total Questions", value: stats?.totalQuestions, icon: HelpCircle, tone: "rose" },
    { label: "Total Job Posts", value: stats?.totalJobs, icon: Briefcase, tone: "amber" },
    { label: "Total Alumni", value: stats?.totalAlumni, icon: GraduationCap, tone: "green" },
    { label: "Total Events", value: stats?.totalEvents, icon: UserPlus, tone: "blue" },
    {
      label: "Pending Verifications",
      value: stats?.pendingVerifications,
      icon: ShieldCheck,
      tone: "amber",
      isWarning: (stats?.pendingVerifications ?? 0) > 0,
    },
    { label: "Verified Resources", value: stats?.verifiedResources, icon: Activity, tone: "green" },
    { label: "Unverified Resources", value: stats?.unverifiedResources, icon: Download, tone: "amber" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      {/* ── Page Header + Period Selector ─────────────────────────────── */}
      <DashboardHeader
        period={period}
        onPeriodChange={setPeriod}
        isRefreshing={isRefreshingCharts}
      />

      {isInitialLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* ── KPI Cards Grid ────────────────────────────────────────── */}
          <section aria-labelledby="kpi-heading">
            <h2 id="kpi-heading" className="sr-only">
              Key metrics
            </h2>
            {statsError && !stats ? (
              <DashboardError
                title="Couldn't load stats"
                description="The overview metrics failed to load. Please try again."
                onRetry={retryStats}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {kpiCards.map((card) => (
                  <StatsCard
                    key={card.label}
                    label={card.label}
                    value={card.value?.toLocaleString() ?? "0"}
                    icon={card.icon}
                    tone={card.tone}
                    isWarning={card.isWarning}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Charts Grid ───────────────────────────────────────────── */}
          <section aria-labelledby="charts-heading">
            <h2 id="charts-heading" className="sr-only">
              Trends
            </h2>
            {isRefreshingCharts ? (
              <DashboardChartsSkeleton />
            ) : chartsError && !charts ? (
              <DashboardError
                title="Couldn't load charts"
                description="Chart data failed to load. Please try again."
                onRetry={retryCharts}
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <AdminChart
                  title="User Registrations"
                  description={`New user sign-ups · last ${period} days`}
                  type="line"
                  data={registrationData}
                  series={[{ dataKey: "users", name: "Users", color: "#6366f1" }]}
                  height={300}
                />

                <AdminChart
                  title="Resource Uploads"
                  description={`Resources uploaded · last ${period} days`}
                  type="bar"
                  data={resourceData}
                  series={[{ dataKey: "uploads", name: "Uploads", color: "#22c55e" }]}
                  height={300}
                />

                <AdminChart
                  title="Popular Departments"
                  description="Users by department"
                  type="bar"
                  data={departmentData}
                  series={[{ dataKey: "count", name: "Students", color: "#f59e0b" }]}
                  xTickFormatter={truncateLabel}
                  height={300}
                  className="xl:col-span-2"
                />

                <AdminChart
                  title="Verification Trends"
                  description={`Verification requests per week · last ${period} days`}
                  type="area"
                  data={verificationData}
                  series={[{ dataKey: "count", name: "Requests", color: "#6366f1" }]}
                  height={300}
                  className="xl:col-span-2"
                />
              </div>
            )}
          </section>

          {/* ── Recent Activity ───────────────────────────────────────── */}
          <section aria-labelledby="activity-heading">
            <h2 id="activity-heading" className="sr-only">
              Recent activity
            </h2>
            {activityError ? (
              <DashboardError
                title="Couldn't load recent activity"
                description="The activity feed failed to load. Please try again."
                onRetry={retryActivity}
              />
            ) : (
              <RecentActivity activities={recentActivity} />
            )}
          </section>
        </>
      )}
    </div>
  );
}
