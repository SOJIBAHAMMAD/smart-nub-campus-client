"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Phone, ExternalLink } from "lucide-react";
import type { ProfileUser } from "@/types/profile.types";

interface ProfileClientProps {
  profileData: ProfileUser;
}

export function ProfileClient({ profileData }: ProfileClientProps) {
  const { name, image, student, profile } = profileData;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      {/* Cover + Avatar Area */}
      <Card className="relative overflow-hidden">
        {profile?.coverImage ? (
          <Image
            src={profile.coverImage}
            alt="Cover"
            width={1200}
            height={300}
            className="h-32 w-full object-cover sm:h-48"
            unoptimized
          />
        ) : (
          <div className="h-32 w-full bg-gradient-to-r from-primary/20 to-primary/5 sm:h-48" />
        )}

        <div className="relative -mt-10 px-6 pb-6">
          {image ? (
            <Image
              src={image}
              alt={name}
              width={80}
              height={80}
              unoptimized
              className="size-20 rounded-full border-4 border-card object-cover"
            />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-full border-4 border-card bg-primary/10 text-2xl font-bold text-primary">
              {name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
          )}

          <div className="mt-3">
            <h1 className="text-2xl font-bold">{name}</h1>
            {student && (
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{student.department}</Badge>
                <span>ID: {student.studentId}</span>
                <span>
                  Batch {student.admissionYear} — {student.admissionSemester}
                </span>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {profile?.currentSemester && (
              <span>Semester {profile.currentSemester}</span>
            )}
            {profile?.batchYear && (
              <span>Batch {profile.batchYear}</span>
            )}
            {profile?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {profile.location}
              </span>
            )}
            {profile?.phoneNumber && (
              <span className="flex items-center gap-1">
                <Phone className="size-3.5" />
                {profile.phoneNumber}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Bio */}
          {profile?.bio && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="mb-2 text-lg font-semibold">About</h2>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {profile.bio}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column — Links */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-3 text-lg font-semibold">Links</h2>
              <div className="space-y-2">
                {profile?.githubUrl && (
                  <Link
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-3.5" />
                    GitHub
                  </Link>
                )}
                {profile?.linkedinUrl && (
                  <Link
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-3.5" />
                    LinkedIn
                  </Link>
                )}
                {profile?.portfolioUrl && (
                  <Link
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-3.5" />
                    Portfolio
                  </Link>
                )}
                {profile?.websiteUrl && (
                  <Link
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-3.5" />
                    Website
                  </Link>
                )}
                {!profile?.githubUrl &&
                  !profile?.linkedinUrl &&
                  !profile?.portfolioUrl &&
                  !profile?.websiteUrl && (
                    <p className="text-sm text-muted-foreground">
                      No links added yet.
                    </p>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Member Since */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-2 text-lg font-semibold">Member Since</h2>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-3.5" />
                {new Date(profileData.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
