"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Globe, Link2, Pencil, Check, X } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { updateProfile } from "@/actions/profile.actions";
import { toast } from "sonner";
import type { ProfileUser } from "@/types/profile.types";

interface ProfileLinksCardProps {
  profileData: ProfileUser;
  isOwnProfile: boolean;
  onProfileUpdate: () => void;
}

interface SocialLinkConfig {
  key: "githubUrl" | "linkedinUrl" | "portfolioUrl" | "websiteUrl";
  label: string;
  icon: React.ReactNode;
  baseUrl: string;
  prefixDisplay: string;
  placeholder: string;
  color?: string;
}

const SOCIAL_CONFIG: SocialLinkConfig[] = [
  {
    key: "githubUrl",
    label: "GitHub",
    icon: <GithubIcon className="size-4" />,
    baseUrl: "https://github.com/",
    prefixDisplay: "github.com/",
    placeholder: "username",
    color: "hover:text-[#333] dark:hover:text-[#f0f6fc]",
  },
  {
    key: "linkedinUrl",
    label: "LinkedIn",
    icon: <LinkedinIcon className="size-4" />,
    baseUrl: "https://linkedin.com/in/",
    prefixDisplay: "linkedin.com/in/",
    placeholder: "username",
    color: "hover:text-[#0077B5]",
  },
  {
    key: "portfolioUrl",
    label: "Portfolio",
    icon: <Link2 className="size-4" />,
    baseUrl: "https://",
    prefixDisplay: "https://",
    placeholder: "yoursite.com",
  },
  {
    key: "websiteUrl",
    label: "Website",
    icon: <Globe className="size-4" />,
    baseUrl: "https://",
    prefixDisplay: "https://",
    placeholder: "yoursite.com",
  },
];

function extractUsername(fullUrl: string | null, baseUrl: string): string {
  if (!fullUrl) return "";
  if (fullUrl.startsWith(baseUrl)) return fullUrl.slice(baseUrl.length);
  return fullUrl;
}

function buildUrl(username: string, baseUrl: string): string | undefined {
  const trimmed = username.trim();
  if (!trimmed) return undefined;
  return baseUrl + trimmed;
}

export function ProfileLinksCard({ profileData, isOwnProfile, onProfileUpdate }: ProfileLinksCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const profileLinks = SOCIAL_CONFIG.map((config) => ({
    ...config,
    value: (profileData.profile?.[config.key] as string | null) ?? null,
  }));

  const hasAnyLinks = profileLinks.some((l) => l.value);

  const startEditing = () => {
    const initial: Record<string, string> = {};
    for (const config of SOCIAL_CONFIG) {
      const fullUrl = profileData.profile?.[config.key] as string | null;
      initial[config.key] = extractUsername(fullUrl, config.baseUrl);
    }
    setUsernames(initial);
    setIsEditing(true);
  };

  const handleSave = () => {
    startTransition(async () => {
      const payload: Record<string, string | undefined> = {};
      for (const config of SOCIAL_CONFIG) {
        payload[config.key] = buildUrl(usernames[config.key] ?? "", config.baseUrl);
      }
      const result = await updateProfile(payload);
      if (result.success) {
        setIsEditing(false);
        onProfileUpdate();
      } else {
        toast.error(result.message || "Failed to save links");
      }
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUsernames({});
  };

  return (
    <Card id="section-links">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Links
        </CardTitle>
        {isOwnProfile && !isEditing && (
          <Button variant="ghost" size="icon" className="size-7" onClick={startEditing}>
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
            {SOCIAL_CONFIG.map((config) => (
              <div key={config.key} className="space-y-1">
                <span className="text-xs text-muted-foreground">{config.label}</span>
                <InputGroup className="h-8">
                  <InputGroupAddon align="inline-start" className="text-xs">
                    {config.prefixDisplay}
                  </InputGroupAddon>
                  <InputGroupInput
                    value={usernames[config.key] ?? ""}
                    onChange={(e) =>
                      setUsernames((prev) => ({ ...prev, [config.key]: e.target.value }))
                    }
                    placeholder={config.placeholder}
                    className="text-xs"
                    disabled={isPending}
                  />
                </InputGroup>
              </div>
            ))}
          </div>
        ) : hasAnyLinks ? (
          <div className="space-y-1.5">
            {profileLinks
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
