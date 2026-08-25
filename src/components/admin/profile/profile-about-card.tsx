import {
  ExternalLink,
  Globe,
  Link2,
  MapPin,
  Pencil,
  Phone,
  User,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AdminProfileProfile } from "./types";

interface ProfileAboutCardProps {
  profile: AdminProfileProfile | null;
  onEdit: () => void;
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-md border border-border/50 bg-muted/30 px-3 py-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-foreground">{children}</p>
      </div>
    </div>
  );
}

/**
 * About card: displays bio, location, phone and social links from the user's
 * profile record. Shows a tasteful empty state when nothing is filled in yet.
 */
export function ProfileAboutCard({ profile, onEdit }: ProfileAboutCardProps) {
  const hasContent = Boolean(
    profile &&
      (profile.bio ||
        profile.location ||
        profile.phoneNumber ||
        profile.websiteUrl ||
        profile.githubUrl ||
        profile.linkedinUrl ||
        profile.portfolioUrl),
  );

  const links = [
    {
      key: "websiteUrl",
      label: "Website",
      url: profile?.websiteUrl,
      icon: <Globe className="size-4" />,
    },
    {
      key: "githubUrl",
      label: "GitHub",
      url: profile?.githubUrl,
      icon: <GithubIcon className="size-4" />,
    },
    {
      key: "linkedinUrl",
      label: "LinkedIn",
      url: profile?.linkedinUrl,
      icon: <LinkedinIcon className="size-4" />,
    },
    {
      key: "portfolioUrl",
      label: "Portfolio",
      url: profile?.portfolioUrl,
      icon: <Link2 className="size-4" />,
    },
  ].filter((link) => link.url);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <User className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground sm:text-[15px]">About</h2>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="size-3.5" />
          <span className="hidden sm:inline">Edit profile</span>
        </Button>
      </CardHeader>

      <CardContent className="pb-5 sm:pb-6">
        {hasContent ? (
          <div className="space-y-5">
            {profile?.bio && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {profile.bio}
              </p>
            )}

            {(profile?.location || profile?.phoneNumber) && (
              <div className="grid gap-3 sm:grid-cols-2">
                {profile?.location && (
                  <DetailRow icon={MapPin} label="Location">
                    {profile.location}
                  </DetailRow>
                )}
                {profile?.phoneNumber && (
                  <DetailRow icon={Phone} label="Phone">
                    {profile.phoneNumber}
                  </DetailRow>
                )}
              </div>
            )}

            {links.length > 0 && (
              <div className="space-y-1.5">
                {links.map((link) => (
                  <a
                    key={link.key}
                    href={link.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <span className="text-muted-foreground group-hover:text-foreground">
                      {link.icon}
                    </span>
                    <span className="w-16 shrink-0 font-medium">{link.label}</span>
                    <span className="min-w-0 flex-1 truncate">{link.url}</span>
                    <ExternalLink className="size-3.5 shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <User className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No profile details yet</p>
              <p className="text-sm text-muted-foreground">
                Add a bio, location and links so colleagues know who you are.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="size-3.5" />
              Add details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
