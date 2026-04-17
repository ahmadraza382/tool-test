"use client";

import Link from "next/link";
import { Menu, Wrench, X } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md lg:hidden">
      <button
        onClick={toggleSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <Wrench className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="text-base font-bold tracking-tight">ToolboxHub</span>
      </Link>

      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
