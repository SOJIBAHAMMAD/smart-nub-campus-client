"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { StatsCard } from "@/components/admin/stats-card";
import { AdminChart } from "@/components/admin/admin-chart";
import { RecentActivity } from "@/components/admin/recent-activity";
import { adminService } from "@/services/admin.service";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Activity,
  UserPlus,
  BookOpen,
  Download,
  MessageSquare,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import type { AdminDashboardStats, AdminDashboardCharts, AuditLogEntry } from "@/types/admin.types";
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
    userName: log.adminUser.name,
    action: action ?? "USER_SIGNED_UP" as const,
    details: log.details
      ? Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(", ")
      : `${log.action.replace(/_/g, " ").toLowerCase()}`,
    timestamp: log.createdAt,
  };
}

// ── Page Component ───────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [charts, setCharts] = useState<AdminDashboardCharts | null>(null);
  const [recentActivity, setRecentActivity] = useState<ReturnType<typeof auditToActivity>[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch {
        toast.error("Failed to load dashboard stats");
      } finally {
        setIsLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchCharts() {
      try {
        const data = await adminService.getDashboardCharts(7);
        setCharts(data);
      } catch {
        toast.error("Failed to load chart data");
      } finally {
        setIsLoadingCharts(false);
      }
    }
    fetchCharts();
  }, []);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const result = await adminService.listAuditLogs({ page: 1, limit: 10 });
        setRecentActivity(result.data.map(auditToActivity));
      } catch {
        toast.error("Failed to load recent activity");
      } finally {
        setIsLoadingActivity(false);
      }
    }
    fetchActivity();
  }, []);

  const isLoading = isLoadingStats || isLoadingCharts || isLoadingActivity;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[350px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

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

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Platform overview and statistics
        </p>
      </div>

      {/* ── Stats Cards Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Users"
          value={stats?.totalUsers?.toLocaleString() ?? "0"}
          icon={Users}
        />
        <StatsCard
          label="Total Resources"
          value={stats?.totalResources?.toLocaleString() ?? "0"}
          icon={BookOpen}
        />
        <StatsCard
          label="Total Discussions"
          value={stats?.totalDiscussions?.toLocaleString() ?? "0"}
          icon={MessageSquare}
        />
        <StatsCard
          label="Total Questions"
          value={stats?.totalQuestions?.toLocaleString() ?? "0"}
          icon={HelpCircle}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Verified Resources"
          value={stats?.verifiedResources?.toLocaleString() ?? "0"}
          icon={Activity}
        />
        <StatsCard
          label="Unverified Resources"
          value={stats?.unverifiedResources?.toLocaleString() ?? "0"}
          icon={Download}
        />
        <StatsCard
          label="Total Events"
          value={stats?.totalEvents?.toLocaleString() ?? "0"}
          icon={UserPlus}
        />
        <StatsCard
          label="Pending Verifications"
          value={stats?.pendingVerifications?.toLocaleString() ?? "0"}
          icon={ShieldCheck}
          isWarning={(stats?.pendingVerifications ?? 0) > 0}
        />
      </div>

      {/* ── Charts Grid (2x2) ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminChart
          title="User Registrations"
          description="New user sign-ups over the last 7 days"
          type="line"
          data={registrationData}
          series={[{ dataKey: "users", name: "Users", color: "#6366f1" }]}
        />

        <AdminChart
          title="Resource Uploads"
          description="Resources uploaded over the last 7 days"
          type="bar"
          data={resourceData}
          series={[{ dataKey: "uploads", name: "Uploads", color: "#22c55e" }]}
        />

        <AdminChart
          title="Popular Departments"
          description="Users by department"
          type="bar"
          data={departmentData}
          series={[{ dataKey: "count", name: "Students", color: "#f59e0b" }]}
        />

        <AdminChart
          title="Verification Trends"
          description="Verification requests per week"
          type="area"
          data={verificationData}
          series={[
            { dataKey: "count", name: "Requests", color: "#6366f1" },
          ]}
        />
      </div>

      {/* ── Recent Activity Table ──────────────────────────────────────── */}
      <RecentActivity activities={recentActivity} />
    </div>
  );
}
