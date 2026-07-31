"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Inbox,
  MessageSquare,
  XCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import ROUTES from "@/constants/routes";
import { ApplicationStatus, UserRole } from "@/constants/enums";
import {
  listMentorshipRequestsAction,
  updateMentorshipRequestAction,
} from "@/actions/mentorship.actions";
import type { MentorshipRequest } from "@/types";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  [ApplicationStatus.PENDING]: "Pending",
  [ApplicationStatus.ACCEPTED]: "Accepted",
  [ApplicationStatus.REJECTED]: "Rejected",
  [ApplicationStatus.WITHDRAWN]: "Withdrawn",
};

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RequestCard({
  request,
  role,
  onRespond,
  pendingId,
}: {
  request: MentorshipRequest;
  role: "mentor" | "mentee";
  onRespond: (id: string, status: string) => void;
  pendingId: string | null;
}) {
  const isMentor = role === "mentor";
  const other = isMentor ? request.mentee : request.mentor;
  const subtitle = isMentor
    ? [
        other.student?.department,
        other.student?.admissionYear ? `Admitted ${other.student.admissionYear}` : null,
      ]
        .filter(Boolean)
        .join(" \u00b7 ")
    : [
        other.profile?.jobTitle,
        other.profile?.currentEmployer,
      ]
        .filter(Boolean)
        .join(" \u00b7 ");

  const isPending = request.status === ApplicationStatus.PENDING;
  const busy = pendingId === request.id;

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
        <Avatar
          id={other.id}
          name={other.name}
          src={other.image}
          className="size-10 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">
              {other.name}
            </p>
            <Badge
              variant={
                request.status === ApplicationStatus.ACCEPTED
                  ? "default"
                  : request.status === ApplicationStatus.REJECTED
                    ? "destructive"
                    : request.status === ApplicationStatus.WITHDRAWN
                      ? "secondary"
                      : "outline"
              }
            >
              {STATUS_LABELS[request.status] ?? request.status}
            </Badge>
          </div>
          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
          {request.topic && (
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Topic:</span>{" "}
              {request.topic}
            </p>
          )}
          {request.message && (
            <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
              {request.message}
            </p>
          )}
          <p className="mt-1.5 text-[11px] text-muted-foreground/70">
            {formatDate(request.createdAt)}
          </p>
        </div>

        {isPending && (
          <div className="flex shrink-0 items-center gap-1.5">
            {isMentor ? (
              <>
                <Button
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => onRespond(request.id, ApplicationStatus.ACCEPTED)}
                  disabled={busy}
                >
                  {busy ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 text-destructive hover:text-destructive"
                  onClick={() => onRespond(request.id, ApplicationStatus.REJECTED)}
                  disabled={busy}
                >
                  {busy ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
                  Decline
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 text-destructive hover:text-destructive"
                onClick={() => onRespond(request.id, ApplicationStatus.WITHDRAWN)}
                disabled={busy}
              >
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
                Withdraw
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MentorshipRequestsClient({
  userRole,
}: {
  userRole?: string;
}) {
  const isMentor = userRole === UserRole.ALUMNI || userRole === UserRole.ADMIN;
  const [tab, setTab] = useState<"incoming" | "outgoing">(
    isMentor ? "incoming" : "outgoing",
  );
  const [incoming, setIncoming] = useState<MentorshipRequest[]>([]);
  const [outgoing, setOutgoing] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [incomingResult, outgoingResult] = await Promise.all([
      listMentorshipRequestsAction({ role: "mentor", limit: 50 }),
      listMentorshipRequestsAction({ role: "mentee", limit: 50 }),
    ]);
    if (incomingResult.success && incomingResult.data) {
      setIncoming((incomingResult.data as { data: MentorshipRequest[] }).data);
    }
    if (outgoingResult.success && outgoingResult.data) {
      setOutgoing((outgoingResult.data as { data: MentorshipRequest[] }).data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleRespond = async (id: string, status: string) => {
    setPendingId(id);
    try {
      const result = await updateMentorshipRequestAction(id, status);
      if (result.success) {
        toast.success("Request updated.");
        await loadAll();
      } else {
        toast.error(result.message || "Failed to update request.");
      }
    } catch {
      toast.error("Failed to update request.");
    } finally {
      setPendingId(null);
    }
  };

  const renderList = (
    requests: MentorshipRequest[],
    role: "mentor" | "mentee",
    emptyTitle: string,
    emptyDescription: string,
  ) => {
    if (loading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      );
    }
    if (requests.length === 0) {
      return (
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
          </EmptyHeader>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </Empty>
      );
    }
    return (
      <div className="space-y-3">
        {requests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            role={role}
            onRespond={handleRespond}
            pendingId={pendingId}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <Link
        href={ROUTES.MENTORSHIP}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to mentorship
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="size-4" />
            Mentorship requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isMentor ? (
            <Tabs
              value={tab}
              onValueChange={(value) => setTab(value as "incoming" | "outgoing")}
            >
              <TabsList className="mb-4 w-full justify-start">
                <TabsTrigger value="incoming">Incoming</TabsTrigger>
                <TabsTrigger value="outgoing">Sent by me</TabsTrigger>
              </TabsList>
              {tab === "incoming"
                ? renderList(
                    incoming,
                    "mentor",
                    "No incoming requests",
                    "When students request your guidance, their requests will appear here.",
                  )
                : renderList(
                    outgoing,
                    "mentee",
                    "No outgoing requests",
                    "Requests you send to mentors will appear here.",
                  )}
            </Tabs>
          ) : (
            renderList(
              outgoing,
              "mentee",
              "No requests yet",
              "Send a request from the mentorship directory to start the conversation.",
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
