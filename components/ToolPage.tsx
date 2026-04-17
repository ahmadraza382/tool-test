import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface ToolPageProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
  badge?: string;
  children: ReactNode;
}

export function ToolPage({
  icon: Icon,
  iconColor,
  title,
  description,
  badge,
  children,
}: ToolPageProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-3 py-6 sm:px-6 sm:py-12 lg:px-8">
      {/* Back link */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All tools
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start gap-3 sm:mb-8 sm:gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 sm:rounded-2xl",
            iconColor
          )}
        >
          <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            {badge && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:mt-1.5 sm:text-base">
            {description}
          </p>
        </div>
      </div>

      {/* Content card */}
      <div className="space-y-5 rounded-2xl border border-border bg-card p-4 shadow-sm sm:space-y-6 sm:p-6">
        {children}
      </div>
    </div>
  );
}
