"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Handshake,
  Search,
  SlidersHorizontal,
  X,
  MessageSquare,
} from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { MentorCard } from "./mentor-card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { listMentorsAction, createMentorshipRequestAction } from "@/actions/mentorship.actions";
import { cn } from "@/lib/utils";
import { DEPARTMENT_LABELS } from "@/lib/constants";
import ROUTES from "@/constants/routes";
import { UserRole } from "@/constants/enums";
import type { Mentor, PaginationMeta } from "@/types";
import { toast } from "sonner";

const PAGE_SIZE = 12;

function FacetButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
        active
          ? "bg-primary/10 font-medium text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <span className="truncate text-left">{label}</span>
    </button>
  );
}

function FacetGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function MentorSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border bg-card p-4 ring-1 ring-foreground/10"
        >
          <div className="flex items-start gap-3">
            <div className="size-11 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-2/3 rounded bg-muted" />
            <div className="h-3 w-1/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface MentorshipListClientProps {
  initialMentors: Mentor[];
  initialMeta: PaginationMeta | null;
  initialFilters: {
    department: string | null;
    topic: string | null;
    page: number;
  };
  userRole?: string;
}

export function MentorshipListClient({
  initialMentors,
  initialMeta,
  initialFilters: _initialFilters,
  userRole,
}: MentorshipListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const department = searchParams.get("department");
  const topic = searchParams.get("topic");

  const [mentors, setMentors] = useState<Mentor[]>(initialMentors);
  const [meta, setMeta] = useState<PaginationMeta | null>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [requestTopic, setRequestTopic] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasFilters = Boolean(department || topic);
  const isStudent = userRole === UserRole.STUDENT;

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      if (!("page" in updates)) {
        params.delete("page");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function fetchData() {
      try {
        const result = await listMentorsAction({
          page,
          limit: PAGE_SIZE,
          department: department ?? undefined,
          topic: topic ?? undefined,
        });
        if (!cancelled && result.success && result.data) {
          const data = result.data as {
            data?: Mentor[];
            meta?: PaginationMeta;
          };
          setMentors(data.data ?? []);
          setMeta(data.meta ?? null);
        }
      } catch {
        // Empty state handled by checking mentors.length
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [page, department, topic, initialized]);

  const total = meta?.total ?? initialMentors.length;
  const totalPages = meta?.totalPages ?? 1;

  const pageNumbers = (() => {
    const items: (number | "ellipsis-start" | "ellipsis-end")[] = [];
    const pages = Math.max(totalPages, 1);
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) {
        items.push(i);
      } else if (i === page - 2) {
        items.push("ellipsis-start");
      } else if (i === page + 2) {
        items.push("ellipsis-end");
      }
    }
    return items;
  })();

  const openRequestDialog = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setRequestTopic("");
    setRequestMessage("");
  };

  const handleSubmitRequest = async () => {
    if (!selectedMentor) return;
    setSubmitting(true);
    try {
      const result = await createMentorshipRequestAction({
        mentorId: selectedMentor.id,
        topic: requestTopic.trim() || undefined,
        message: requestMessage.trim() || undefined,
      });
      if (result.success) {
        toast.success("Mentorship request sent!");
        setSelectedMentor(null);
      } else {
        toast.error(result.message || "Failed to send request.");
      }
    } catch {
      toast.error("Failed to send request.");
    } finally {
      setSubmitting(false);
    }
  };

  const sidebar = (
    <div className="space-y-6">
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-xs"
          onClick={() => updateParams({ department: null, topic: null })}
        >
          <X className="size-3.5" />
          Clear all filters
        </Button>
      )}

      <FacetGroup title="Department">
        {Object.entries(DEPARTMENT_LABELS).map(([value, label]) => (
          <FacetButton
            key={value}
            label={label}
            active={department === value}
            onClick={() =>
              updateParams({ department: department === value ? null : value })
            }
          />
        ))}
      </FacetGroup>

      {isStudent && (
        <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Students can request guidance from any mentor. You can track
            incoming responses on your{" "}
            <Link
              href={ROUTES.MENTORSHIP_REQUESTS}
              className="font-medium text-primary hover:underline"
            >
              mentorship requests
            </Link>{" "}
            page.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <PageLayout leftSidebar={sidebar} leftSidebarTitle="Filters">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Handshake className="size-5 text-primary" />
            Mentorship
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {total > 0
              ? `${total} mentor${total === 1 ? "" : "s"} open to guiding NUB students`
              : "Find alumni mentors from Northern University Bangladesh"}
          </p>
        </div>

        {isStudent && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            render={<Link href={ROUTES.MENTORSHIP_REQUESTS} />}
            nativeButton={false}
          >
            <MessageSquare className="size-3.5" />
            My requests
          </Button>
        )}
      </div>

      {/* Mobile filter affordance */}
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <SlidersHorizontal className="size-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Use the Filters button to narrow by department.
        </span>
      </div>

      {loading ? (
        <MentorSkeleton />
      ) : mentors.length === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search className="size-6" />
            </EmptyMedia>
            <EmptyTitle>
              {hasFilters ? "No mentors match your filters" : "No mentors yet"}
            </EmptyTitle>
          </EmptyHeader>
          <EmptyDescription>
            {hasFilters
              ? "Try clearing a filter or checking back later."
              : "Alumni who opt in as mentors will appear here."}
          </EmptyDescription>
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => updateParams({ department: null, topic: null })}
            >
              Clear filters
            </Button>
          )}
        </Empty>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                onRequest={isStudent ? openRequestDialog : () => {}}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) updateParams({ page: String(page - 1) });
                    }}
                    aria-disabled={page <= 1}
                    className={cn(page <= 1 && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>

                {pageNumbers.map((item, index) =>
                  item === "ellipsis-start" || item === "ellipsis-end" ? (
                    <PaginationItem key={`${item}-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href="#"
                        isActive={item === page}
                        onClick={(e) => {
                          e.preventDefault();
                          if (item !== page) updateParams({ page: String(item) });
                        }}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) updateParams({ page: String(page + 1) });
                    }}
                    aria-disabled={page >= totalPages}
                    className={cn(
                      page >= totalPages && "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* ── Request dialog ─────────────────────────────────────── */}
      <Dialog open={selectedMentor !== null} onOpenChange={(open) => { if (!open) setSelectedMentor(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Request mentorship from {selectedMentor?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedMentor?.profile?.jobTitle
                ? `${selectedMentor.profile.jobTitle}${selectedMentor.profile.currentEmployer ? ` at ${selectedMentor.profile.currentEmployer}` : ""}`
                : "NUB alumnus"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="mentor-topic">Topic (optional)</Label>
              <Input
                id="mentor-topic"
                value={requestTopic}
                onChange={(e) => setRequestTopic(e.target.value)}
                placeholder="e.g. Career guidance, resume review, interview prep"
                maxLength={100}
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mentor-message">Message (optional)</Label>
              <Textarea
                id="mentor-message"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Introduce yourself and what you'd like to learn..."
                rows={4}
                maxLength={1000}
                disabled={submitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedMentor(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitRequest} disabled={submitting}>
              {submitting ? "Sending..." : "Send request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
