"use client";

import { GraduationCap, Hash, Calendar, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProfileUser } from "@/types/profile.types";
import { DEPARTMENT_LABELS, type Department } from "@/lib/constants";

interface ProfileAcademicCardProps {
  profileData: ProfileUser;
}

export function ProfileAcademicCard({ profileData }: ProfileAcademicCardProps) {
  const { student, profile } = profileData;

  if (!student) return null;

  const departmentLabel = student
    ? DEPARTMENT_LABELS[student.department as Department] ?? student.department
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="size-4" />
          Academic Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
          {profile?.currentSemester && (
            <div className="flex items-center gap-2">
              <BookOpen className="size-3.5" />
              <span>Current Semester: {profile.currentSemester}</span>
            </div>
          )}
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
