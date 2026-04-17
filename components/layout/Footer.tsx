import Link from "next/link";
import { Wrench } from "lucide-react";
import { tools } from "@/lib/tools-data";

export function Footer() {
  const pdfTools = tools.filter((t) => t.category === "pdf");
  const imageTools = tools.filter((t) => t.category === "image");
  const aiTools = tools.filter((t) => t.category === "ai");

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-sky-400 to-sky-600">
                <Wrench className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold text-foreground">
                Tool<span className="text-primary">dit</span>
              </span>
            </Link>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              PDF Tools
            </h4>
            <ul className="space-y-2">
              {pdfTools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={tool.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Image Tools
            </h4>
            <ul className="space-y-2">
              {imageTools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={tool.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              AI Tools
            </h4>
            <ul className="space-y-2">
              {aiTools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={tool.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:mt-10 sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Tooldit.</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link
              href="/privacy"
              className="transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-foreground"
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-foreground"
            >
              Contact Us
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
