import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — ToolboxHub",
  description:
    "The terms that govern your use of ToolboxHub. Free to use, no warranty, use responsibly.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to home
      </Link>

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: April 17, 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground">
        <section>
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your access to and
            use of ToolboxHub (the &quot;Service&quot;). By using the Service,
            you agree to these Terms. If you do not agree, do not use the
            Service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            Use of the Service
          </h2>
          <p className="text-muted-foreground">
            ToolboxHub provides free, browser-based utilities for working with
            PDFs, images, and similar files. You may use the Service for any
            lawful purpose, personal or commercial.
          </p>
          <p className="mt-3 text-muted-foreground">You agree not to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
            <li>
              Use the Service to process files you do not have permission to use
            </li>
            <li>
              Attempt to disrupt, overload, or reverse-engineer the Service
            </li>
            <li>
              Use the Service to violate any applicable law or third-party right
            </li>
            <li>
              Scrape, resell, or redistribute the Service without written
              permission
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            Your Content
          </h2>
          <p className="text-muted-foreground">
            Files you process through our tools remain yours. Because processing
            happens entirely in your browser, we do not receive, store, or have
            any access to those files. You are solely responsible for the
            content you process.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            Intellectual Property
          </h2>
          <p className="text-muted-foreground">
            The ToolboxHub name, logo, and site design are the property of
            ToolboxHub. The underlying source code and content are protected by
            copyright and other intellectual-property laws.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            Disclaimer of Warranty
          </h2>
          <p className="text-muted-foreground">
            The Service is provided &quot;AS IS&quot; and &quot;AS
            AVAILABLE&quot;, without warranties of any kind, either express or
            implied. We do not warrant that the Service will be uninterrupted,
            error-free, or produce any particular result. You use the Service at
            your own risk.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            Limitation of Liability
          </h2>
          <p className="text-muted-foreground">
            To the fullest extent permitted by law, ToolboxHub shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages, including loss of data or profits, arising out of
            your use of the Service — even if we have been advised of the
            possibility of such damages.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            Third-Party Services
          </h2>
          <p className="text-muted-foreground">
            The Service may display advertising from third parties (such as
            Google AdSense) and may link to third-party sites. We are not
            responsible for the content, products, or practices of any
            third-party service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            Changes to These Terms
          </h2>
          <p className="text-muted-foreground">
            We may update these Terms at any time. Continued use of the Service
            after changes are posted constitutes acceptance of the revised
            Terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            Governing Law
          </h2>
          <p className="text-muted-foreground">
            These Terms are governed by the laws of the jurisdiction in which
            ToolboxHub is operated, without regard to conflict-of-law
            principles.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            Contact
          </h2>
          <p className="text-muted-foreground">
            Questions about these Terms? Reach us at{" "}
            <a
              href="mailto:corp.work03@gmail.com"
              className="text-primary hover:underline"
            >
              corp.work03@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
