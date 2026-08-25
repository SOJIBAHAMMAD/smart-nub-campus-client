"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { MapPin } from "lucide-react";

/**
 * Custom 404 page displayed for unknown routes.
 * Shows a campus-themed illustration with a "Go Home" link.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-24 items-center justify-center rounded-full bg-primary/10">
        <MapPin className="size-12 text-primary" />
      </div>

      <div className="space-y-2">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <h2 className="text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist on Smart NUB Campus.
          It may have been moved or the URL might be incorrect.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/" className={buttonVariants()}>
          Go Home
        </Link>
        <Link href="/resources" className={buttonVariants({ variant: "secondary" })}>
          Browse Resources
        </Link>
      </div>
    </div>
  );
}
