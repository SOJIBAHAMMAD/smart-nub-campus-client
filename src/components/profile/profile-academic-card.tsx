"use client";

import { useState, useTransition } from "react";
import { GraduationCap, Hash, Calendar, BookOpen, Pencil, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/actions/profile.actions";
import { toast } from "sonner";
import type { ProfileUser } from "@/types/profile.types";
import { DEPARTMENT_LABELS, type Department } from "@/lib/constants";

interface ProfileAcademicCardProps {
  profileData: ProfileUser;
  isOwnProfile: boolean;
  onProfileUpdate: () => void;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function ProfileAcademicCard({ profileData, isOwnProfile, onProfileUpdate }: ProfileAcademicCardProps) {
  const { student, profile } = profileData;
  const [isEditing, setIsEditing] = useState(false);
  const [semesterValue, setSemesterValue] = useState(profile?.currentSemester?.toString() ?? "");
  const [isPending, startTransition] = useTransition();

  if (!student) return null;

  const departmentLabel = student
    ? DEPARTMENT_LABELS[student.department as Department] ?? student.department
    : null;

  const handleSave = () => {
    const num = parseInt(semesterValue, 10);
    if (!num || num < 1 || num > 16) {
      toast.error("Semester must be between 1 and 12");
      return;
    }
    startTransition(async () => {
      const result = await updateProfile({ currentSemester: num });
      if (result.success) {
        setIsEditing(false);
        onProfileUpdate();
      } else {
        toast.error(result.message || "Failed to update semester");
      }
    });
  };

  const handleCancel = () => {
    setSemesterValue(profile?.currentSemester?.toString() ?? "");
    setIsEditing(false);
  };

  return (
    <Card id="section-academic">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="size-4" />
          Academic Info
        </CardTitle>
        {isOwnProfile && !isEditing && (
          <Button variant="ghost" size="icon" className="size-7" onClick={() => setIsEditing(true)}>
            <Pencil className="size-3.5" />
          </Button>
        )}
        {isEditing && (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="size-7" onClick={handleSave} disabled={isPending}>
              <Check className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="size-7" onClick={handleCancel} disabled={isPending}>
              <X className="size-3.5" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3 pb-5 sm:pb-6">
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline">{departmentLabel}</Badge>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Hash className="size-3.5" />
            <span>Student ID: {student.studentId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="size-3.5" />
            <span>
              Admitted: {student.admissionSemester} {student.admissionYear}
            </span>
          </div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <BookOpen className="size-3.5" />
              <span>Current Semester:</span>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={semesterValue}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val === "" || (parseInt(val) >= 1 && parseInt(val) <= 12)) {
                    setSemesterValue(val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") handleCancel();
                }}
                className="h-7 w-16 text-xs"
                autoFocus
                disabled={isPending}
              />
            </div>
          ) : (profile?.currentSemester || isOwnProfile) ? (
            <div className="flex items-center gap-2">
              <BookOpen className="size-3.5" />
              <span>Current Semester: {ordinal(profile.currentSemester)}</span>
            </div>
          ) : null}
          {profile?.batchYear && (
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5" />
              <span>Batch: {profile.batchYear}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
