import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { alumniService } from "@/services/alumni.service";
import { MemberProfile } from "@/components/alumni/member-profile";
import { PageLayoutSkeleton } from "@/components/skeletons/page-layout-skeleton";
import type { DirectoryMemberDetail } from "@/types";

export const metadata: Metadata = {
  title: "Alumni Profile | Smart NUB Campus",
  description:
    "Alumni profile for a member of the Northern University Bangladesh community.",
};

export default async function AlumniMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let member: DirectoryMemberDetail | null = null;
  try {
    member = await alumniService.getDirectoryMember(id);
  } catch {
    notFound();
  }

  if (!member) {
    notFound();
  }

  return (
    <Suspense fallback={<PageLayoutSkeleton />}>
      <MemberProfile member={member} />
    </Suspense>
  );
}
