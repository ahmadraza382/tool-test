"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  ImageIcon,
  Sparkles,
  Gamepad2,
  Search,
  type LucideIcon,
} from "lucide-react";
import { tools, categories } from "@/lib/tools-data";
import { games } from "@/lib/games-data";
import { cn } from "@/lib/cn";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const q = search.toLowerCase().trim();
  const filtered = tools.filter((tool) => {
    const matchesCategory =
      activeCategory === "all" || tool.category === activeCategory;
    const matchesSearch =
      !q ||
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const categoryIcons: Record<string, LucideIcon> = {
    pdf: FileText,
    image: ImageIcon,
    ai: Sparkles,
  };

  return (
    <div>
      {/* Hero section */}
      <section className="hero-gradient border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            All-in-One Free
            <br />
            <span className="bg-linear-to-r from-sky-400 via-sky-500 to-sky-700 bg-clip-text text-transparent">
              Online Toolbox
            </span>
          </h1>
        </div>
      </section>

      {/* Tools section */}
      <section
        id="tools"
        className="mx-auto max-w-7xl px-4 py-10 scroll-mt-20 sm:px-6 sm:py-16 lg:px-8"
      >
        {/* Category filter + search */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-x-visible sm:px-0 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => {
              const CatIcon = cat.id !== "all" ? categoryIcons[cat.id] : null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  {CatIcon && <CatIcon className="h-3.5 w-3.5" />}
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="relative sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Tool grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5 sm:p-5"
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 sm:mb-4 sm:h-12 sm:w-12",
                      tool.color
                    )}
                  >
                    <ToolIcon className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
                  </div>

                  {/* Text */}
                  <h3 className="text-sm font-semibold leading-tight text-card-foreground sm:text-base">
                    {tool.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:mt-1.5 sm:line-clamp-none sm:text-sm">
                    {tool.description}
                  </p>

                  {/* Hover arrow */}
                  <div className="mt-4 hidden items-center gap-1 text-sm font-medium text-primary opacity-0 transition-all group-hover:opacity-100 sm:flex">
                    Open tool
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>

                  {/* Subtle gradient border glow on hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="absolute -inset-px rounded-2xl bg-linear-to-br from-primary/10 via-transparent to-sky-400/10" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="text-sm font-medium text-foreground">
              No tools found
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a different search term or category
            </p>
          </div>
        )}
      </section>

      {/* Games section */}
      <section
        id="games"
        className="mx-auto max-w-7xl px-4 pb-10 scroll-mt-20 sm:px-6 sm:pb-16 lg:px-8"
      >
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              <Gamepad2 className="h-7 w-7 text-sky-500" />
              Games
            </h2>
          </div>
          <Link
            href="/games"
            className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {games.map((game) => {
            const GameIcon = game.icon;
            return (
              <div
                key={game.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-5"
              >
                <div
                  className={cn(
                    "mb-3 flex h-10 w-10 items-center justify-center rounded-xl sm:mb-4 sm:h-12 sm:w-12",
                    game.color
                  )}
                >
                  <GameIcon className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
                </div>
                <h3 className="text-base font-semibold text-card-foreground">
                  {game.name}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {game.description}
                </p>
              </div>
            );
          })}
        </div>

        <Link
          href="/games"
          className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline sm:hidden"
        >
          View all games
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      {/* How It Works */}
      <section className="relative border-t border-border bg-sky-50/80 dark:bg-sky-950/30">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent"
        />
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>

          <div className="relative mt-12 grid gap-10 sm:grid-cols-3">
            <div
              aria-hidden
              className="pointer-events-none absolute left-[16.67%] right-[16.67%] top-7 hidden h-px bg-linear-to-r from-primary/0 via-primary/30 to-primary/0 sm:block"
            />
            {[
              { n: 1, title: "Choose a Tool" },
              { n: 2, title: "Upload Your File" },
              { n: 3, title: "Download Result" },
            ].map(({ n, title }) => (
              <div
                key={n}
                className="relative flex flex-col items-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/30">
                  {n}
                </div>
                <h3 className="mt-5 text-base font-semibold text-foreground">
                  {title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
