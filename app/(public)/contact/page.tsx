import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Bug, Lightbulb } from "lucide-react";

export const metadata = {
  title: "Contact Us — Tooldit",
  description:
    "Get in touch with the Tooldit team. Feedback, bug reports, and feature requests welcome.",
};

export default function ContactPage() {
  const channels = [
    {
      icon: Mail,
      title: "Email",
      description:
        "For general questions, partnerships, or anything else — we read every message.",
      action: "corp.work03@gmail.com",
      href: "mailto:corp.work03@gmail.com",
    },
    {
      icon: Bug,
      title: "Bug reports",
      description:
        "Found something broken? Let us know which tool, what browser, and what happened.",
      action: "Report a bug",
      href: "mailto:corp.work03@gmail.com?subject=Bug%20report",
    },
    {
      icon: Lightbulb,
      title: "Feature requests",
      description:
        "Have an idea for a new tool or improvement? We'd love to hear it.",
      action: "Suggest a feature",
      href: "mailto:corp.work03@gmail.com?subject=Feature%20request",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to home
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
          <MessageSquare className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Contact Us
          </h1>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-1">
        {channels.map(({ icon: Icon, title, description, action, href }) => (
          <a
            key={title}
            href={href}
            className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-card-foreground">
                {title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                {action}
                <span className="transition-transform group-hover:translate-x-0.5">
                  &rarr;
                </span>
              </span>
            </div>
          </a>
        ))}
      </div>

    </div>
  );
}
