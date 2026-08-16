import type { ReactNode } from "react";
import { FileText, ListChecks, Mail, Shield } from "lucide-react";
import { Hyperlink } from "@/components/ui/hyperlink";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

interface LegalDocumentProps {
  kicker: string;
  title: string;
  description: string;
  summaryTitle: string;
  summary: ReactNode;
  effectiveDate: string;
  sections: LegalSection[];
  contactEmail: string;
  footerNote: ReactNode;
}

export function LegalDocument({
  kicker,
  title,
  description,
  summaryTitle,
  summary,
  effectiveDate,
  sections,
  contactEmail,
  footerNote,
}: LegalDocumentProps) {
  return (
    <main className="space-y-10 sm:space-y-14">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-campus px-6 py-14 sm:px-12 sm:py-16 text-center">
        <div className="absolute inset-0 bg-linear-to-b from-background/85 via-background/60 to-background/90 dark:from-background/85 dark:via-background/70 dark:to-background/90" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 backdrop-blur-sm">
            <FileText className="h-7 w-7 text-brand dark:text-primary" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand dark:text-primary">
            {kicker}
          </p>
          <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            {description}
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <Shield className="h-3.5 w-3.5 text-brand dark:text-primary" />
            Effective {effectiveDate}
          </p>
        </div>
      </section>

      {/* ── Plain-language summary ───────────────────────────────── */}
      <section className="mx-auto max-w-3xl">
        <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-(--card-shadow)">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand dark:text-primary">
            {summaryTitle}
          </p>
          <div className="mt-3 space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            {summary}
          </div>
        </div>
      </section>

      {/* ── On this page (mobile) ────────────────────────────────── */}
      <section className="mx-auto max-w-3xl lg:hidden">
        <nav className="rounded-2xl border bg-card/60 p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5 text-brand dark:text-primary" />
            On this page
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
              >
                {index + 1}. {section.title}
              </a>
            ))}
          </div>
        </nav>
      </section>

      {/* ── Body: sticky TOC + content ───────────────────────────── */}
      <section className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-8 border-l border-border/70">
            <p className="mb-3 flex items-center gap-1.5 pl-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <ListChecks className="h-3.5 w-3.5 text-brand dark:text-primary" />
              On this page
            </p>
            {sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="-ml-px block border-l-2 border-transparent py-1 pl-4 text-sm text-muted-foreground transition-colors hover:border-brand hover:text-foreground dark:hover:border-primary"
              >
                {index + 1}. {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 space-y-12">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="mx-auto w-full max-w-3xl scroll-mt-10"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                <span className="mr-2 text-brand dark:text-primary">
                  {index + 1}.
                </span>
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl">
        <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-(--card-shadow)">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light dark:bg-primary/15">
              <Mail className="h-5 w-5 text-brand dark:text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Questions?
            </h2>
          </div>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            If you have questions about this document or anything on the
            platform, contact us at{" "}
            <Hyperlink href={`mailto:${contactEmail}`} className="text-brand">
              {contactEmail}
            </Hyperlink>
            .
          </p>
          <div className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            {footerNote}
          </div>
        </div>
      </section>
    </main>
  );
}
