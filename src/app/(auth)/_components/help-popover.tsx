"use client";

import Link from "next/link";
import { CircleQuestionMark, Mail, KeyRound, ShieldCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ROUTES from "@/constants/routes";

export function HelpPopover() {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className="size-9 px-0 sm:h-9 sm:w-auto sm:px-4"
          />
        }
      >
        <CircleQuestionMark className="size-4" />
        <span className="hidden sm:inline">Need Help?</span>
        <span className="sr-only">Need Help?</span>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-64 p-2">
        <p className="px-2 pb-1.5 text-xs font-medium text-muted-foreground">
          How can we help?
        </p>
        <nav className="flex flex-col gap-0.5">
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <KeyRound className="size-4 shrink-0 text-muted-foreground" />
            Forgot Password
          </Link>
          <Link
            href={ROUTES.VERIFY_EMAIL}
            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
            Verify Email
          </Link>
          <Link
            href={ROUTES.ABOUT}
            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Info className="size-4 shrink-0 text-muted-foreground" />
            About Smart NUB
          </Link>
          <a
            href="mailto:support@nub.ac.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Mail className="size-4 shrink-0 text-muted-foreground" />
            Contact Support
          </a>
        </nav>
      </PopoverContent>
    </Popover>
  );
}
