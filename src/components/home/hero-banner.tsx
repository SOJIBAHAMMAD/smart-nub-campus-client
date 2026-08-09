"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { Search, BookOpen, Users, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { useGlobalSearch } from "@/hooks/use-global-search";
import ROUTES from "@/constants/routes";

const students = [
  { id: "1", name: "Sarah", src: null },
  { id: "2", name: "Ahmed", src: null },
  { id: "3", name: "Priya", src: null },
  { id: "4", name: "Hasan", src: null },
  { id: "5", name: "Nusrat", src: null },
  { id: "6", name: "Rafiq", src: null },
];

export function HeroBanner() {
  const { open } = useGlobalSearch();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      open(searchQuery.trim() || undefined);
    },
    [open, searchQuery],
  );

  return (
    <section className="relative overflow-hidden border-b border-border/50 bg-background">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 size-[500px] rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-[400px] rounded-full bg-brand/[0.04] blur-3xl" />
        <div className="absolute top-1/2 left-1/3 size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.03] blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(to right, var(--border) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="mx-auto flex max-w-screen-2xl flex-col items-center gap-12 px-6 py-20 md:flex-row md:py-32 lg:gap-16 xl:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 space-y-7 text-center md:text-left"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.04] px-4 py-1.5 text-xs font-medium text-primary">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            Northern University Bangladesh
          </div>

          <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Your Academic
            <br />
            <span className="bg-linear-to-r from-primary to-[#8b5cf6] bg-clip-text text-transparent">
              Command Center
            </span>
          </h1>

          <p className="mx-auto max-w-lg text-balance text-muted-foreground sm:text-lg md:mx-0">
            Study materials, project teams, campus discussions, and AI-powered
            assistance — everything a NUB student needs, unified in one
            platform.
          </p>

          <form
            onSubmit={handleSearch}
            role="search"
            className="mx-auto max-w-lg md:mx-0"
          >
            <div className="group relative">
              <div className="absolute -inset-0.5 rounded-xl bg-linear-to-r from-primary/30 to-brand/30 opacity-0 blur transition duration-300 group-hover:opacity-100" />
              <div className="relative flex items-center">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  type="search"
                  placeholder="Search resources, courses, people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full rounded-xl border-border/60 bg-card pl-11 pr-4 text-sm shadow-sm transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:border-primary/30 focus-visible:ring-4 focus-visible:ring-primary/5"
                />
              </div>
            </div>
          </form>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link
              href={ROUTES.RESOURCES}
              className={buttonVariants({ size: "lg" })}
            >
              <BookOpen className="size-4" />
              Explore Resources
            </Link>
            <Link
              href={ROUTES.TEAMS}
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              <Users className="size-4" />
              Find Study Teams
            </Link>
          </div>

          <div className="flex items-center gap-4 pt-1 sm:justify-center md:justify-start">
            <AvatarGroup items={students} max={5} size="size-9" />
            <div className="text-left text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">2,500+</span>{" "}
              students already connected
              <br />
              <span className="text-xs text-muted-foreground/60">
                From all departments of NUB
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="hidden w-full max-w-md flex-1 md:block"
        >
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/[0.08] via-brand/[0.04] to-primary/[0.06] blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-xl backdrop-blur-sm">
              <div className="border-b border-border/40 bg-muted/30 px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Smart NUB Campus
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dashboard Preview
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="rounded-lg border border-border/40 bg-muted/30 p-3.5">
                  <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                    Today
                  </p>
                  <div className="mt-2 space-y-2">
                    {[
                      {
                        label: "CSE 201 - Data Structures",
                        type: "quiz",
                        time: "Due 2:00 PM",
                      },
                      {
                        label: "Team Meeting: AI Project",
                        type: "meeting",
                        time: "4:30 PM",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-md bg-card px-3 py-2 text-xs"
                      >
                        <span className="font-medium text-foreground">
                          {item.label}
                        </span>
                        <span className="text-muted-foreground">
                          {item.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Resources",
                      value: "524",
                      color: "text-violet-500",
                    },
                    {
                      label: "Notes Shared",
                      value: "1,247",
                      color: "text-blue-500",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg border border-border/40 bg-muted/30 p-3"
                    >
                      <p className="text-[11px] text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className={`text-xl font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3.5 py-2.5">
                  <Sparkles className="size-3.5 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">AI Tip:</span>{" "}
                    3 new resources match your courses
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
