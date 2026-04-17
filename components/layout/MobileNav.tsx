"use client";

import { useAppStore } from "@/store/app-store";
import { Sidebar } from "./Sidebar";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function MobileNav() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  if (!sidebarOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setSidebarOpen(false)}
      />
      {/* Drawer */}
      <div className="absolute inset-y-0 left-0 w-64 animate-slide-in">
        <Sidebar />
      </div>
    </div>
  );
}
