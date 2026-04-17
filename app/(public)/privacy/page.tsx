import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Tooldit",
  description:
    "How Tooldit handles your data. Short answer: we don't collect your files — everything runs in your browser.",
};

export default function PrivacyPage() {
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
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: April 17, 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground">
        <section>
          <p>
            Tooldit (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates
            the Tooldit website (the &quot;Service&quot;). This page informs
            you of our policies regarding the collection, use, and disclosure of
            information when you use our Service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            Files You Process
          </h2>
          <p className="text-muted-foreground">
            All file processing happens locally in your browser. The files you
            upload to any Tooldit tool (PDFs, images, etc.) are never
            transmitted to our servers, never stored by us, and never shared with
            any third party. Processing occurs entirely on your device using
            client-side JavaScript and WebAssembly.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            Information We Collect
          </h2>
          <p className="text-muted-foreground">
            We may collect limited anonymous technical information through
            standard web analytics, including:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-muted-foreground">
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Referring website</li>
            <li>Pages visited and time spent</li>
            <li>Approximate geographic region (country level)</li>
          </ul>
          <p className="mt-3 text-muted-foreground">
            This data is aggregated and cannot be used to identify you
            personally. We do not use tracking pixels or fingerprinting.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            Cookies
          </h2>
          <p className="text-muted-foreground">
            We use essential cookies only — for example, to remember your theme
            preference (light or dark). We do not set advertising or tracking
            cookies ourselves. If we display ads in the future via third-party
            networks (such as Google AdSense), those networks may set their own
            cookies under their own privacy policies.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            Third-Party Services
          </h2>
          <p className="text-muted-foreground">
            Tooldit may use the following third-party services:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">
                Google AdSense
              </strong>{" "}
              — for displaying ads. Google may use cookies to personalize ads
              based on your prior visits. You can opt out at{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Ad Settings
              </a>
              .
            </li>
            <li>
              <strong className="font-medium text-foreground">
                Web hosting and CDN providers
              </strong>{" "}
              — to deliver the site. These providers may log basic request data
              (IP, user-agent) for security and performance.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            Children&apos;s Privacy
          </h2>
          <p className="text-muted-foreground">
            Our Service is not directed at anyone under 13. We do not knowingly
            collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            Your Rights
          </h2>
          <p className="text-muted-foreground">
            Since we do not collect personal data from your use of the tools,
            there is typically no personal data to access, correct, or delete.
            For any questions about data you believe we may hold, contact us at
            the address below.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            Changes to This Policy
          </h2>
          <p className="text-muted-foreground">
            We may update this Privacy Policy from time to time. Changes are
            effective when posted on this page, and the &quot;Last updated&quot;
            date will reflect the revision.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            Contact
          </h2>
          <p className="text-muted-foreground">
            Questions about this policy? Reach us at{" "}
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
