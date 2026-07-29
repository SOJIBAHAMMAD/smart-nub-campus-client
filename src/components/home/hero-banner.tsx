import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

/** Hero section at the top of the home page — headline, subtext, CTAs, and avatar stack. */
export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-primary/5 via-background to-primary/10">
      <div className="mx-auto flex max-w-360 flex-col items-center gap-8 px-4 py-16 sm:px-6 md:flex-row md:py-24">
        {/* ── Text content ─────────────────────────────────────────── */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Connect. Collaborate.
            <br />
            Grow Together.
          </h1>

          <p className="mx-auto max-w-lg text-muted-foreground sm:text-lg md:mx-0">
            Smart NUB Campus is your all-in-one platform for study materials,
            team finding, and campus connections.
          </p>

          {/* ── CTA buttons ────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link href="/resources" className={buttonVariants()}>
              Explore Resources
            </Link>
            <Link
              href="/teams"
              className={buttonVariants({ variant: "secondary" })}
            >
              Find Teams
            </Link>
          </div>

          {/* ── Avatar stack ───────────────────────────────────────── */}
          <div className="flex items-center gap-3 pt-2 sm:justify-center md:justify-start">
            {/* Placeholder avatars */}
            <div className="flex -space-x-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="size-8 rounded-full border-2 border-background bg-primary/20"
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Join <span className="font-medium text-foreground">2,543+</span>{" "}
              NUB students
            </p>
          </div>
        </div>

        {/* ── Illustration placeholder ─────────────────────────────── */}
        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="flex size-64 items-center justify-center rounded-2xl bg-primary/5 lg:size-80">
            <span className="text-primary/30">Campus Illustration</span>
          </div>
        </div>
      </div>
    </section>
  );
}
