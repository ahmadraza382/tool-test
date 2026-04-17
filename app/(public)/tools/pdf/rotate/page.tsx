"use client";

import { useState } from "react";
import {
  RotateCw,
  FileText,
  Download as DownloadIcon,
  AlertTriangle,
} from "lucide-react";
import { ToolPage } from "@/components/ToolPage";
import { Dropzone } from "@/components/Dropzone";
import { ProgressBar } from "@/components/ProgressBar";

export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [applyTo, setApplyTo] = useState<"all" | "custom">("all");
  const [pages, setPages] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    const pdf = files.find((f) => f.type === "application/pdf");
    if (pdf) {
      setFile(pdf);
      setError(null);
    }
  };

  const parsePages = (input: string, total: number): Set<number> => {
    const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
    const set = new Set<number>();
    for (const part of parts) {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map((s) => parseInt(s.trim(), 10));
        if (Number.isNaN(a) || Number.isNaN(b)) continue;
        for (let i = Math.min(a, b); i <= Math.max(a, b); i++) {
          if (i >= 1 && i <= total) set.add(i - 1);
        }
      } else {
        const n = parseInt(part, 10);
        if (!Number.isNaN(n) && n >= 1 && n <= total) set.add(n - 1);
      }
    }
    return set;
  };

  const handleRotate = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      setProgressLabel("Loading PDF...");
      const { PDFDocument, degrees } = await import("pdf-lib");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const total = pdf.getPageCount();

      const targetIndices =
        applyTo === "all"
          ? new Set(Array.from({ length: total }, (_, i) => i))
          : parsePages(pages, total);

      if (targetIndices.size === 0) {
        throw new Error(
          `No valid pages selected. PDF has ${total} pages.`
        );
      }

      setProgress(20);
      setProgressLabel(`Rotating ${targetIndices.size} pages...`);

      const allPages = pdf.getPages();
      let processed = 0;
      for (const idx of targetIndices) {
        const page = allPages[idx];
        const current = page.getRotation().angle;
        page.setRotation(degrees((current + rotation) % 360));
        processed++;
        setProgress(20 + Math.round((processed / targetIndices.size) * 70));
      }

      setProgressLabel("Saving PDF...");
      const outBytes = await pdf.save();
      setProgress(100);

      const blob = new Blob([outBytes as BlobPart], {
        type: "application/pdf",
      });
      const baseName = file.name.replace(/\.pdf$/i, "");
      downloadBlob(blob, `${baseName}-rotated.pdf`);

      setProgressLabel("Done!");
      setTimeout(() => {
        setProcessing(false);
        setProgress(0);
        setProgressLabel("");
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to rotate PDF.");
      setProcessing(false);
      setProgress(0);
      setProgressLabel("");
    }
  };

  return (
    <ToolPage
      icon={RotateCw}
      iconColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
      title="Rotate PDF"
      description="Rotate PDF pages to any orientation."
    >
      {!file ? (
        <Dropzone accept=".pdf" multiple={false} onFiles={handleFiles} />
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <FileText className="h-5 w-5 text-blue-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{file.name}</p>
          </div>
          <button
            onClick={() => {
              setFile(null);
              setError(null);
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Change
          </button>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Rotation Angle</h3>
        <div className="flex gap-2">
          {([90, 180, 270] as const).map((deg) => (
            <button
              key={deg}
              onClick={() => setRotation(deg)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                rotation === deg
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              <RotateCw
                className="h-4 w-4"
                style={{ transform: `rotate(${deg}deg)` }}
              />
              {deg}°
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Apply To</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setApplyTo("all")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              applyTo === "all"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            All Pages
          </button>
          <button
            onClick={() => setApplyTo("custom")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              applyTo === "custom"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            Specific Pages
          </button>
        </div>
        {applyTo === "custom" && (
          <input
            type="text"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            placeholder="e.g. 1,3,5-8"
            className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        )}
      </div>

      {processing && <ProgressBar progress={progress} label={progressLabel} />}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/20 dark:bg-red-500/5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <p className="text-xs leading-relaxed text-red-700 dark:text-red-300">
            {error}
          </p>
        </div>
      )}

      <button
        onClick={handleRotate}
        disabled={
          !file ||
          processing ||
          (applyTo === "custom" && !pages.trim())
        }
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DownloadIcon className="h-4 w-4" />
        {processing ? "Rotating..." : "Rotate PDF"}
      </button>
    </ToolPage>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
