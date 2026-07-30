"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationCarouselHeader,
  InlineCitationCarouselPrev,
  InlineCitationCarouselNext,
  InlineCitationCarouselIndex,
  InlineCitationSource,
} from "@/components/ai-elements/inline-citation";

export interface CitationSource {
  id: number;
  url?: string;
  title?: string;
}

export interface CitationParseResult {
  cleanedText: string;
  sources: CitationSource[];
}

export function parseCitations(text: string): CitationParseResult {
  const sources: CitationSource[] = [];
  const sourceDefs = new Map<number, CitationSource>();

  const sourceSectionMatch = text.match(
    /(?:\n|\r)(?:Sources|References|Citations)[:\s]*\n([\s\S]*)/i,
  );

  let mainText = text;

  if (sourceSectionMatch) {
    const sourceLines = sourceSectionMatch[1].split("\n");
    for (const line of sourceLines) {
      const match = line.match(/^\s*\[(\d+)\]\s*(?::\s*)?(.+)$/);
      if (match) {
        const id = parseInt(match[1], 10);
        const value = match[2].trim();
        const urlMatch = value.match(
          /(https?:\/\/[^\s]+(?:\.[^\s]+)+[^\s\]\)]*)/,
        );
        const title = urlMatch
          ? value.replace(urlMatch[1], "").replace(/^[-–—\s]+/, "").trim()
          : value;
        sourceDefs.set(id, {
          id,
          url: urlMatch ? urlMatch[1].replace(/[)\]]$/, "") : undefined,
          title: title || undefined,
        });
        sources.push(sourceDefs.get(id)!);
      }
    }

    mainText = text.replace(sourceSectionMatch[0], "").trim();
  }

  // Only convert [N] to citation links when N has an actual source definition.
  // Without a "Sources" section, all [N] patterns (e.g. Python list syntax [0])
  // would incorrectly become citation links.
  if (sourceDefs.size > 0) {
    mainText = mainText.replace(
      /\[(\d+)\]/g,
      (_, num) => {
        const id = parseInt(num, 10);
        if (sourceDefs.has(id)) {
          if (!sources.some((s) => s.id === id)) {
            sources.push(sourceDefs.get(id)!);
          }
          return `[${id}](#citation-${id})`;
        }
        // No matching source definition — keep original text
        return `[${num}]`;
      },
    );
  }

  return { cleanedText: mainText, sources };
}

export function CitationSources({
  sources,
}: {
  sources: CitationSource[];
}) {
  const [open, setOpen] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="mt-3 border-t pt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="h-auto px-0 py-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronDown
          className={cn(
            "mr-1 size-3 transition-transform",
            open && "rotate-180",
          )}
        />
        {sources.length} source{sources.length > 1 ? "s" : ""}
      </Button>
      {open && (
        <div className="mt-1 space-y-1.5">
          {sources.map((source) => (
            <div
              key={source.id}
              className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs"
            >
              <span className="mt-px flex size-4 shrink-0 items-center justify-center rounded bg-muted-foreground/20 text-[10px] font-medium text-muted-foreground">
                {source.id}
              </span>
              <div className="min-w-0 flex-1">
                {source.title && (
                  <p className="truncate font-medium text-foreground">
                    {source.title}
                  </p>
                )}
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 truncate text-muted-foreground hover:text-primary"
                  >
                    <ExternalLink className="size-3 shrink-0" />
                    <span className="truncate">{source.url}</span>
                  </a>
                )}
              </div>
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="Open source"
                >
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MessageCitationLink({
  href,
  children,
  sources,
}: {
  href: string;
  children: React.ReactNode;
  sources: CitationSource[];
}) {
  const match = href.match(/^#citation-(\d+)$/);
  if (!match) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  const id = parseInt(match[1], 10);
  const citationSources = sources.filter((s) => s.id === id);
  if (citationSources.length === 0) {
    return (
      <a href={href}>{children}</a>
    );
  }

  return (
    <InlineCitation>
      <InlineCitationCard>
        <InlineCitationCardTrigger sources={citationSources.map((s) => s.url ?? "")} />
        <InlineCitationCardBody>
          <InlineCitationCarousel>
            <InlineCitationCarouselContent>
              <InlineCitationCarouselHeader>
                <InlineCitationCarouselPrev />
                <InlineCitationCarouselIndex />
                <InlineCitationCarouselNext />
              </InlineCitationCarouselHeader>
              {citationSources.map((source) => (
                <InlineCitationCarouselItem key={source.id}>
                  <InlineCitationSource
                    title={source.title}
                    url={source.url}
                  />
                </InlineCitationCarouselItem>
              ))}
            </InlineCitationCarouselContent>
          </InlineCitationCarousel>
        </InlineCitationCardBody>
      </InlineCitationCard>
      <InlineCitationText>{children}</InlineCitationText>
    </InlineCitation>
  );
}