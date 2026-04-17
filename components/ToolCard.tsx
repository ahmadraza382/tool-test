import Link from "next/link";
import type { Tool } from "@/lib/tools-data";
import { cn } from "@/lib/cn";
import { ArrowRight } from "lucide-react";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;

  return (
    <Link
      href={tool.href}
      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-lg",
          tool.color
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-card-foreground">
          {tool.name}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {tool.description}
        </p>
      </div>
      <div className="mt-auto flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Open tool <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
