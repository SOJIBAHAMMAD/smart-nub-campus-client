import Link from "next/link";
import { InformationCircleIcon } from "@/components/ui/icons/information-circle";
import { AcademicCapIcon } from "@/components/ui/icons/academic-cap";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { Hyperlink } from "@/components/ui/hyperlink";
import { HelpPopover } from "./_components/help-popover";
import ROUTES from "@/constants/routes";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex px-4 py-6 flex-col space-y-4 sm:space-y-8">
      <header className="w-full flex justify-between items-center px-1 sm:px-0">
        <Link href={ROUTES.AUTH} className="flex items-center gap-1.5 sm:gap-2">
          <AcademicCapIcon className="text-brand" size={32} />
          <div className="-space-y-0.5 sm:-space-y-1">
            <h1 className="font-bold text-base sm:text-xl text-foreground">
              Smart NUB
            </h1>
            <p className="text-brand text-xs sm:text-sm font-bold">Campus</p>
          </div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <ModeToggle />
          <Link
            href={ROUTES.ABOUT}
            className="text-sm font-medium text-muted-foreground hover:text-foreground items-center gap-2 hidden sm:flex"
          >
            <InformationCircleIcon />
            About Smart NUB Campus
          </Link>
          <HelpPopover />
        </div>
      </header>

      <main className="flex-1 min-h-[calc(100vh-120px)] sm:min-h-[calc(100vh-180px)]">
        {children}
      </main>
      <footer className="w-full max-w-3xl mx-auto flex justify-between items-center text-xs text-muted-foreground flex-col sm:flex-row gap-3 sm:gap-4 px-1 sm:px-0">
        <p>
          © {new Date().getFullYear()} Northern University Bangladesh. All
          rights reserved.
        </p>
        <div className="flex gap-4">
          <Hyperlink href={ROUTES.PRIVACY} className="text-brand">
            Privacy Policy
          </Hyperlink>
          <span>•</span>
          <Hyperlink href={ROUTES.TERMS} className="text-brand">
            Terms of Use
          </Hyperlink>
        </div>
      </footer>
    </div>
  );
}
