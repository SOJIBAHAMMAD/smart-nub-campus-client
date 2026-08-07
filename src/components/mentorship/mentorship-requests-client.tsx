"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Inbox,
  MessageSquare,
  XCircle,
  Loader2,
} from "lucide-react";
import { MentorshipNav } from "./mentorship-nav";
import { MentorshipGuideSidebar } from "./mentorship-guide-sidebar";
import { PageLayout } from "@/components/layout/page-layout";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
      <CardContent className="flex gap-3 p-4">
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
                request.status === ApplicationStatus.PENDING
                  ? "outline"
                  : request.status === ApplicationStatus.ACCEPTED
                    ? "secondary"
                    : request.status === ApplicationStatus.WITHDRAWN
                      ? "ghost"
                      : "outline"
              }
              className={
                request.status === ApplicationStatus.REJECTED
                  ? "text-muted-foreground"
                  : undefined
              }
            >
              {STATUS_LABELS[request.status] ?? request.status}
            </Badge>
            {formatDate(request.createdAt) && (
              <time className="ml-auto text-[11px] text-muted-foreground/70">
                {formatDate(request.createdAt)}
              </time>
            )}
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
          {request.goals && request.goals.length > 0 && (
            <div className="mt-1.5 space-y-1">
              {request.goals.map((goal, index) => (
                <p key={`${request.id}-goal-${index}`} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <span className="mt-1 size-1 shrink-0 rounded-full bg-primary/60" />
                  <span className="line-clamp-1">{goal}</span>
                </p>
              ))}
            </div>
          )}
          {request.message && (
            <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
              {request.message}
            </p>
          )}
        </div>
      </CardContent>

      {isPending && (
        <CardFooter className="justify-end gap-1.5 border-t px-4 py-2.5 sm:px-5">
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
        </CardFooter>
      )}
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
    <PageLayout
      leftSidebar={<MentorshipGuideSidebar kind="requests" />}
      leftSidebarTitle="Mentorship"
    >
      <MentorshipNav />
      <div className="mt-4 space-y-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <MessageSquare className="size-5 text-primary" />
            My requests
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isMentor
              ? "Review requests from students and keep track of the ones you've sent."
              : "Track the requests you've sent and their responses."}
          </p>
        </div>

        {isMentor && (
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as "incoming" | "outgoing")}
          >
            <TabsList
              variant="line"
              className="w-full justify-start gap-1 border-b border-border p-0 sm:w-fit"
            >
              <TabsTrigger value="incoming" className="gap-1.5 rounded-none px-3 after:bg-primary">
                Incoming
                {incoming.length > 0 && ` (${incoming.length})`}
              </TabsTrigger>
              <TabsTrigger value="outgoing" className="gap-1.5 rounded-none px-3 after:bg-primary">
                Sent by me
              </TabsTrigger>
            </TabsList>
            <div className="mt-4">
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
            </div>
          </Tabs>
        )}

        {!isMentor && (
          <div>
            {renderList(
              outgoing,
              "mentee",
              "No requests yet",
              "Send a request from the mentorship directory to start the conversation.",
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
