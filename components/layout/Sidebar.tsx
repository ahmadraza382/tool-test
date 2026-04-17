"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  ImageIcon,
  Sparkles,
  Download,
  ChevronDown,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: { label: string; href: string }[];
}

const navGroups: NavGroup[] = [
  {
    label: "PDF Tools",
    icon: FileText,
    items: [
      { label: "Merge PDF", href: "/tools/pdf/merge" },
      { label: "Split PDF", href: "/tools/pdf/split" },
      { label: "Compress PDF", href: "/tools/pdf/compress" },
      { label: "PDF to Images", href: "/tools/pdf/convert" },
      { label: "Rotate PDF", href: "/tools/pdf/rotate" },
      { label: "Protect PDF", href: "/tools/pdf/password" },
    ],
  },
  {
    label: "Image Tools",
    icon: ImageIcon,
    items: [
      { label: "Image Converter", href: "/tools/image-converter" },
      { label: "Image Editor", href: "/tools/image-editor" },
      { label: "SVG to PNG", href: "/tools/svg-to-png" },
    ],
  },
  {
    label: "AI Tools",
    icon: Sparkles,
    items: [
      { label: "Background Remover", href: "/tools/bg-remover" },
      { label: "Object Remover", href: "/tools/object-remover" },
    ],
  },
  {
    label: "Utilities",
    icon: Download,
    items: [{ label: "URL Downloader", href: "/tools/downloader" }],
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-border bg-card",
        className
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Wrench className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground">
          Tool<span className="text-primary">dit</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {navGroups.map((group) => (
          <NavSection key={group.label} group={group} pathname={pathname} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <ThemeToggle />
        <p className="mt-3 text-xs text-muted-foreground">
          100% free &middot; No data collection
        </p>
      </div>
    </aside>
  );
}

function NavSection({
  group,
  pathname,
}: {
  group: NavGroup;
  pathname: string;
}) {
  const isActive = group.items.some((item) => pathname === item.href);
  const [open, setOpen] = useState(isActive);
  const Icon = group.icon;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-3">
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-2.5 py-1.5 text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
