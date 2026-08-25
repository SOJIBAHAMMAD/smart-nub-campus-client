"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, PartyPopper, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { transitionToAlumniAction } from "@/actions/alumni.actions";
import type { GraduationInfo } from "@/types";

const SEMESTER_LABELS = {
  SPRING: "Spring",
  SUMMER: "Summer",
  FALL: "Fall",
} as const;

function formatDate(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface TransitionDialogProps {
  graduation: GraduationInfo;
}

export function TransitionDialog({ graduation }: TransitionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const res = await transitionToAlumniAction();
      if (res.success) {
        toast.success(res.message);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (dismissed) return null;

  const semester = graduation.graduationSemester
    ? (SEMESTER_LABELS[graduation.graduationSemester] ??
      graduation.graduationSemester)
    : null;
  const graduationDate = formatDate(graduation.graduationDate);

  return (
    <div className="relative overflow-hidden rounded-xl border border-brand/20 bg-linear-to-r from-brand/10 via-brand/5 to-transparent p-4 sm:p-5">
      <div className="flex items-start gap-4">
        <div className="hidden shrink-0 rounded-lg bg-brand/15 p-2.5 sm:block">
          <GraduationCap className="size-6 text-brand" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              Your graduation has been recorded
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
              <PartyPopper className="size-3" />
              Ready for alumni transition
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {graduation.degreeTitle ?? "Your degree"}
            {graduation.graduationYear
              ? ` · Class of ${graduation.graduationYear}`
              : ""}
            {graduation.cgpa ? ` · CGPA ${graduation.cgpa}` : ""} — confirm to
            become an active member of the NUB alumni community.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger render={<Button size="sm" />}>
                Review Alumni Status
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Become an Alumnus of NUB</DialogTitle>
                  <DialogDescription>
                    Confirm the details below to join the alumni community. Your
                    account role will change from Student to Alumni.
                  </DialogDescription>
                </DialogHeader>

                <dl className="space-y-2.5 rounded-lg border bg-muted/30 p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Degree</dt>
                    <dd className="text-right font-medium">
                      {graduation.degreeTitle ?? "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Graduation</dt>
                    <dd className="text-right font-medium">
                      {[graduation.graduationYear ?? null, semester]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </dd>
                  </div>
                  {graduationDate && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Graduation date</dt>
                      <dd className="text-right font-medium">
                        {graduationDate}
                      </dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">CGPA</dt>
                    <dd className="text-right font-medium">
                      {graduation.cgpa ?? "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Department</dt>
                    <dd className="text-right font-medium">
                      {graduation.department}
                    </dd>
                  </div>
                </dl>

                <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                  <li>Your role changes to Alumni.</li>
                  <li>You keep full access to all current campus features.</li>
                  <li>Your batch year is set from your graduation year.</li>
                  <li>You earn the &ldquo;Alumnus&rdquo; badge.</li>
                </ul>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isSubmitting}
                  >
                    Not now
                  </Button>
                  <Button onClick={handleConfirm} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <GraduationCap className="size-4" />
                    )}
                    Become an Alumni
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss graduation banner"
            >
              <X className="size-4" />
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
