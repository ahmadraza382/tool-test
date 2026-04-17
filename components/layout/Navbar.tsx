"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Wrench,
  FileText,
  ImageIcon,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Gamepad2,
  Search,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/ThemeToggle";
import { tools } from "@/lib/tools-data";
import { games } from "@/lib/games-data";

interface NavCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

const navCategories: NavCategory[] = [
  {
    id: "pdf",
    label: "PDF Tools",
    icon: FileText,
    color: "text-blue-500",
    description: "Merge, split, compress and convert PDFs",
  },
  {
    id: "image",
    label: "Image Tools",
    icon: ImageIcon,
    color: "text-cyan-500",
    description: "Convert, edit and transform images",
  },
  {
    id: "ai",
    label: "AI Tools",
    icon: Sparkles,
    color: "text-sky-500",
    description: "AI-powered image processing",
  },
  {
    id: "games",
    label: "Games",
    icon: Gamepad2,
    color: "text-sky-500",
    description: "Quick, fun browser games",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchOpen) {
      setSearchQuery("");
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [searchOpen]);

  const q = searchQuery.toLowerCase().trim();
  const searchMatches = q
    ? [
        ...tools.map((t) => ({ ...t, kind: "tool" as const })),
        ...games.map((g) => ({ ...g, kind: "game" as const })),
      ].filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      )
    : [];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between bg-surface/80 px-3 backdrop-blur-xl sm:h-16 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-sky-400 to-sky-600 shadow-lg shadow-primary/20 sm:h-9 sm:w-9">
            <Wrench className="h-4 w-4 text-white sm:h-4.5 sm:w-4.5" />
          </div>
          <div
            className={cn(
              searchOpen && "hidden sm:inline"
            )}
          >
            <span className="text-base font-bold tracking-tight text-foreground sm:text-lg">
              Toolbox
            </span>
            <span className="text-base font-bold tracking-tight text-primary sm:text-lg">
              Hub
            </span>
          </div>
        </Link>

        {/* Desktop nav categories */}
        <div className="hidden items-center gap-1 lg:flex">
          {navCategories.map((cat) => {
            const categoryTools =
              cat.id === "games"
                ? games
                : tools.filter((t) => t.category === cat.id);
            const isHovered = activeDropdown === cat.id;
            const hasActiveTool = categoryTools.some(
              (t) => pathname === t.href
            );

            return (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => setActiveDropdown(cat.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {/* Trigger button */}
                <button
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    hasActiveTool
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <cat.icon className={cn("h-4 w-4", isHovered && cat.color)} />
                  {cat.label}
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform",
                      isHovered && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown */}
                {isHovered && (
                  <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2">
                    <div className="animate-dropdown min-w-[320px] rounded-2xl border border-border bg-card p-2 shadow-xl shadow-black/8 dark:shadow-black/30">
                      {/* Category header */}
                      <div className="mb-1 flex items-center gap-2 px-3 py-2">
                        <cat.icon className={cn("h-5 w-5", cat.color)} />
                        <p className="text-sm font-semibold text-card-foreground">
                          {cat.label}
                        </p>
                      </div>

                      <div className="h-px bg-border" />

                      {/* Tool list */}
                      <div className="mt-1 space-y-0.5">
                        {categoryTools.map((tool) => {
                          const ToolIcon = tool.icon;
                          const isActive = pathname === tool.href;
                          return (
                            <Link
                              key={tool.id}
                              href={tool.href}
                              className={cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                                isActive
                                  ? "bg-primary/8 text-primary"
                                  : "text-card-foreground hover:bg-muted"
                              )}
                            >
                              <div
                                className={cn(
                                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                                  tool.color
                                )}
                              >
                                <ToolIcon className="h-4 w-4" />
                              </div>
                              <span className="flex-1 min-w-0 truncate text-sm font-medium">
                                {tool.name}
                              </span>
                              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          {/* Inline search */}
          <div ref={searchRef} className="relative">
            {searchOpen && (
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, games..."
                className="animate-dropdown absolute right-full top-0 mr-1 h-9 w-[min(14rem,calc(100vw-7.5rem))] rounded-full border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-60"
              />
            )}

            {searchOpen && searchQuery && (
              <div className="animate-dropdown absolute right-0 top-full mt-2 max-h-[60vh] w-80 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-xl shadow-black/10 dark:shadow-black/40">
                {searchMatches.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                    No results for &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {searchMatches.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={`${item.kind}-${item.id}`}
                          href={item.href}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-2 py-2 text-card-foreground transition-colors hover:bg-muted"
                        >
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                              item.color
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">
                            {item.name}
                          </span>
                          <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:block">
                            {item.kind}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={searchOpen ? "Close search" : "Search tools and games"}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {searchOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
          </div>

          <ThemeToggle />

          {/* CTA */}
          <Link
            href="/#tools"
            className="ml-1 hidden h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition-colors hover:bg-primary/90 lg:inline-flex"
          >
            Browse Tools
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu + blurred backdrop */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            aria-hidden
            className="fixed inset-x-0 bottom-0 top-14 z-40 bg-black/30 backdrop-blur-sm sm:top-16 lg:hidden"
          />
          <MobileMenu
            categories={navCategories}
            pathname={pathname}
            onClose={() => setMobileOpen(false)}
          />
        </>
      )}
    </nav>
  );
}

function MobileMenu({
  categories,
  pathname,
  onClose,
}: {
  categories: NavCategory[];
  pathname: string;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="animate-slide-down absolute left-0 right-0 top-full z-50 max-h-[calc(100vh-3.5rem)] space-y-2 overflow-y-auto border-t border-border bg-card px-3 py-4 shadow-2xl shadow-black/30 dark:shadow-black/60 lg:hidden">
      {categories.map((cat) => {
        const categoryTools =
          cat.id === "games"
            ? games
            : tools.filter((t) => t.category === cat.id);
        const isOpen = expanded === cat.id;

        return (
          <div
            key={cat.id}
            className="overflow-hidden rounded-xl border border-border/50 bg-background/40 transition-colors last:mb-0"
          >
            <button
              onClick={() => setExpanded(isOpen ? null : cat.id)}
              className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50"
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5",
                  cat.color
                )}
              >
                <cat.icon className="h-4 w-4" />
              </div>
              <span className="flex-1 text-sm font-semibold text-foreground">
                {cat.label}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {isOpen && (
              <div className="animate-slide-down space-y-0.5 border-t border-border/50 bg-muted/30 p-2">
                {categoryTools.map((tool) => {
                  const ToolIcon = tool.icon;
                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
                        pathname === tool.href
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-card-foreground hover:bg-muted"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                          tool.color
                        )}
                      >
                        <ToolIcon className="h-3.5 w-3.5" />
                      </div>
                      <span className="flex-1 truncate">{tool.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
