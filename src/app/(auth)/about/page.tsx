import Link from "next/link";
import {
  BookOpen,
  MessageCircle,
  Users,
  Sparkles,
  Shield,
  GraduationCap,
  ArrowRight,
  FileText,
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hyperlink } from "@/components/ui/hyperlink";
import ROUTES from "@/constants/routes";

const stats = [
  { value: "50+", label: "Departments Covered" },
  { value: "1000+", label: "Resources Shared" },
  { value: "24/7", label: "AI Assistance" },
  { value: "100%", label: "Student Verified" },
];

export default function AboutPage() {
  return (
    <main className="space-y-20 sm:space-y-32">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-campus px-6 py-16 sm:px-12 sm:py-24 text-center">
        <div className="absolute inset-0 bg-linear-to-b from-background/80 via-background/60 to-background/90 dark:from-background/80 dark:via-background/70 dark:to-background/90" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 backdrop-blur-sm">
            <GraduationCap className="h-7 w-7 text-brand dark:text-primary" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
            Your campus deserves
            <br />
            <span className="text-brand dark:text-primary">
              better than
            </span>{" "}
            scattered PDFs and dead group chats.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Smart NUB Campus brings resources, discussions, teams, and AI
            assistance into one verified space built exclusively for Northern
            University Bangladesh students.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="default"
              size="lg"
              nativeButton={false}
              render={
                <Link href={ROUTES.ONBOARDING}>
                  Get Started Free
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              }
            />
            <Button
              variant="ghost"
              size="lg"
              nativeButton={false}
              render={
                <Link href={ROUTES.LOGIN}>I already have an account</Link>
              }
            />
          </div>
        </div>
      </section>

      {/* ── Story ────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand dark:text-primary">
          Why we built this
        </p>
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-foreground leading-snug">
          Every semester, the same problem repeats itself.
        </h2>
        <div className="mt-6 space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
          <p>
            You need last year&apos;s notes for a course. You ask around in a
            WhatsApp group. Someone replies three days later with a blurry
            photo. The Google Drive link someone shared is broken. The study
            group forming for the midterm has no space for you.
          </p>
          <p>
            Northern University Bangladesh has thousands of talented students
            across dozens of departments. But the tools connecting them are
            fragmented — chat apps, shared drives, social media DMs. Nothing is
            built for how students actually collaborate.
          </p>
          <p>
            Smart NUB Campus fixes this. One platform where every NUB student
            can find resources, ask questions, form teams, and get AI-powered
            help — all in a space where every member is verified.
          </p>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border/60 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card px-4 py-8 sm:px-6 text-center"
            >
              <p className="text-3xl sm:text-4xl font-bold text-brand dark:text-primary">
                {stat.value}
              </p>
              <p className="mt-1.5 text-xs sm:text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features (Bento Grid) ────────────────────────────────── */}
      <section className="max-w-5xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand dark:text-primary text-center">
          What you get
        </p>
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-foreground text-center">
          Everything in one place
        </h2>

        <div className="mt-10 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[1fr]">
          {/* Wide card: Resources */}
          <div className="group rounded-2xl border bg-card p-6 sm:p-8 shadow-(--card-shadow) transition-all duration-200 hover:shadow-(--card-shadow-hover) sm:col-span-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light dark:bg-primary/15">
              <BookOpen className="h-5 w-5 text-brand dark:text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Shared Resources
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Lecture notes, slides, study guides, past papers — all organized
              by course and semester. No more hunting through chat histories for
              that one PDF.
            </p>
          </div>

          {/* Tall card: AI */}
          <div className="group rounded-2xl border bg-card p-6 sm:p-8 shadow-(--card-shadow) transition-all duration-200 hover:shadow-(--card-shadow-hover) row-span-1 sm:row-span-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light dark:bg-primary/15">
              <BrainCircuit className="h-5 w-5 text-brand dark:text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              AI Study Assistant
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Stuck on a concept at 2 AM? Our AI helps explain topics, suggests
              study approaches, and works through problems with you — available
              around the clock.
            </p>
          </div>

          {/* Standard card: Discussions */}
          <div className="group rounded-2xl border bg-card p-6 sm:p-8 shadow-(--card-shadow) transition-all duration-200 hover:shadow-(--card-shadow-hover)">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light dark:bg-primary/15">
              <MessageCircle className="h-5 w-5 text-brand dark:text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Discussions & Q&A
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Ask questions, share insights, get answers from peers who&apos;ve
              taken the same courses.
            </p>
          </div>

          {/* Standard card: Teams */}
          <div className="group rounded-2xl border bg-card p-6 sm:p-8 shadow-(--card-shadow) transition-all duration-200 hover:shadow-(--card-shadow-hover)">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light dark:bg-primary/15">
              <Users className="h-5 w-5 text-brand dark:text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Teams
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Form project groups, study clubs, and orgs with shared spaces and
              real-time updates.
            </p>
          </div>

          {/* Wide card: Networking */}
          <div className="group rounded-2xl border bg-card p-6 sm:p-8 shadow-(--card-shadow) transition-all duration-200 hover:shadow-(--card-shadow-hover) sm:col-span-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light dark:bg-primary/15">
              <Sparkles className="h-5 w-5 text-brand dark:text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Academic Network
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Connect with classmates across departments, discover study
              partners, and build relationships that last beyond graduation.
            </p>
          </div>
        </div>
      </section>

      {/* ── Who It's For ─────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto">
        <div className="rounded-2xl border bg-card p-6 sm:p-10 shadow-(--card-shadow)">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light dark:bg-primary/15">
              <FileText className="h-5 w-5 text-brand dark:text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Built for NUB students
            </h2>
          </div>
          <div className="mt-6 space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">New to NUB?</strong> Verify
              your student identity and get instant access. Find your
              classmates, explore resources from your department, and settle in
              faster.
            </p>
            <p>
              <strong className="text-foreground">Already here?</strong> Share
              what you know, find what you need, and stay connected with the
              people and courses that matter to you.
            </p>
            <p>
              <strong className="text-foreground">
                Running a club or org?
              </strong>{" "}
              Use teams and discussion spaces to manage members, coordinate
              events, and keep everyone on the same page.
            </p>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand dark:text-primary">
          What we believe
        </p>
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-foreground">
          Principles, not platitudes
        </h2>
        <div className="mt-8 space-y-6">
          <div className="flex gap-4">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light dark:bg-primary/15">
              <Shield className="h-4 w-4 text-brand dark:text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Every student is verified
              </h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                No trolls, no spam accounts. Access is restricted to verified
                NUB students. Your data is protected with industry-standard
                encryption and we never sell your information.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light dark:bg-primary/15">
              <BookOpen className="h-4 w-4 text-brand dark:text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Knowledge grows when shared
              </h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                The best way to learn is to teach. We&apos;ve seen it hundreds
                of times — a student shares notes, someone asks a follow-up
                question, and both walk away understanding the material better.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light dark:bg-primary/15">
              <GraduationCap className="h-4 w-4 text-brand dark:text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Academic success is collaborative
              </h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                From semester planning to exam prep, the students who succeed
                fastest are the ones who help each other. Smart NUB Campus makes
                that collaboration effortless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-brand/5 border border-brand/10 px-6 py-16 sm:px-12 sm:py-20 text-center">
        <h2 className="text-2xl sm:text-4xl font-bold text-foreground">
          Start learning smarter today
        </h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
          Join the NUB students who are already sharing resources, forming
          teams, and succeeding together.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="default"
            size="lg"
            nativeButton={false}
            render={
              <Link href={ROUTES.ONBOARDING}>
                Create Your Account
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            }
          />
          <Button
            variant="ghost"
            size="lg"
            nativeButton={false}
            render={<Link href={ROUTES.LOGIN}>Login instead</Link>}
          />
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Questions?{" "}
          <Hyperlink href="mailto:support@nub.ac.bd" className="text-brand">
            support@nub.ac.bd
          </Hyperlink>
        </p>
      </section>
    </main>
  );
}
