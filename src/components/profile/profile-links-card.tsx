"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Globe, Link2, Pencil, Check, X } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/actions/profile.actions";
import { toast } from "sonner";
import type { ProfileUser } from "@/types/profile.types";

interface ProfileLinksCardProps {
  profileData: ProfileUser;
  isOwnProfile: boolean;
  onProfileUpdate: () => void;
}

interface SocialLink {
  key: "githubUrl" | "linkedinUrl" | "portfolioUrl" | "websiteUrl";
  label: string;
  icon: React.ReactNode;
  value: string | null;
  color?: string;
}

export function ProfileLinksCard({ profileData, isOwnProfile, onProfileUpdate }: ProfileLinksCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    githubUrl: profileData.profile?.githubUrl ?? "",
    linkedinUrl: profileData.profile?.linkedinUrl ?? "",
    portfolioUrl: profileData.profile?.portfolioUrl ?? "",
    websiteUrl: profileData.profile?.websiteUrl ?? "",
  });
  const [isPending, startTransition] = useTransition();

  const links: SocialLink[] = [
    {
      key: "githubUrl",
      label: "GitHub",
      icon: <GithubIcon className="size-4" />,
      value: profileData.profile?.githubUrl ?? null,
      color: "hover:text-[#333] dark:hover:text-[#f0f6fc]",
    },
    {
      key: "linkedinUrl",
      label: "LinkedIn",
      icon: <LinkedinIcon className="size-4" />,
      value: profileData.profile?.linkedinUrl ?? null,
      color: "hover:text-[#0077B5]",
    },
    {
      key: "portfolioUrl",
      label: "Portfolio",
      icon: <Link2 className="size-4" />,
      value: profileData.profile?.portfolioUrl ?? null,
    },
    {
      key: "websiteUrl",
      label: "Website",
      icon: <Globe className="size-4" />,
      value: profileData.profile?.websiteUrl ?? null,
    },
  ];

  const hasAnyLinks = links.some((l) => l.value);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateProfile({
        githubUrl: editValues.githubUrl || undefined,
        linkedinUrl: editValues.linkedinUrl || undefined,
        portfolioUrl: editValues.portfolioUrl || undefined,
        websiteUrl: editValues.websiteUrl || undefined,
      });
      if (result.success) {
        setIsEditing(false);
        onProfileUpdate();
      } else {
        toast.error(result.message || "Failed to save links");
      }
    });
  };

  const handleCancel = () => {
    setEditValues({
      githubUrl: profileData.profile?.githubUrl ?? "",
      linkedinUrl: profileData.profile?.linkedinUrl ?? "",
      portfolioUrl: profileData.profile?.portfolioUrl ?? "",
      websiteUrl: profileData.profile?.websiteUrl ?? "",
    });
    setIsEditing(false);
  };

  return (
    <Card id="section-links">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Links
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
      <CardContent>
        {isEditing ? (
          <div className="space-y-2">
            {links.map((link) => (
              <div key={link.key} className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-xs text-muted-foreground">{link.label}</span>
                <Input
                  value={editValues[link.key]}
                  onChange={(e) =>
                    setEditValues((prev) => ({ ...prev, [link.key]: e.target.value }))
                  }
                  placeholder={`Your ${link.label} URL`}
                  className="h-8 text-xs"
                  disabled={isPending}
                />
              </div>
            ))}
          </div>
        ) : hasAnyLinks ? (
          <div className="space-y-1.5">
            {links
              .filter((l) => l.value)
              .map((link) => (
                <a
                  key={link.key}
                  href={link.value!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${link.color ?? ""}`}
                >
                  {link.icon}
                  <span className="flex-1 truncate">{link.value}</span>
                  <ExternalLink className="size-3 shrink-0" />
                </a>
              ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground/60">
            {isOwnProfile
              ? "Add links to your online presence."
              : "No links added yet."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
