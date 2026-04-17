"use client";

import { useState } from "react";
import {
  Scissors,
  FileText,
  Download as DownloadIcon,
  AlertTriangle,
} from "lucide-react";
import { ToolPage } from "@/components/ToolPage";
import { Dropzone } from "@/components/Dropzone";
import { ProgressBar } from "@/components/ProgressBar";

type SplitMode = "range" | "extract" | "every";

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<SplitMode>("range");
  const [pageRange, setPageRange] = useState("");
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

  const parseRange = (input: string, total: number): number[] => {
    const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
    const set = new Set<number>();
    for (const part of parts) {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map((s) => parseInt(s.trim(), 10));
        if (Number.isNaN(a) || Number.isNaN(b)) continue;
        for (let i = Math.min(a, b); i <= Math.max(a, b); i++) {
          if (i >= 1 && i <= total) set.add(i);
        }
      } else {
        const n = parseInt(part, 10);
        if (!Number.isNaN(n) && n >= 1 && n <= total) set.add(n);
      }
    }
    return Array.from(set).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      setProgressLabel("Loading PDF...");
      const { PDFDocument } = await import("pdf-lib");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const total = source.getPageCount();
      const baseName = file.name.replace(/\.pdf$/i, "");
      setProgress(10);

      if (mode === "range" || mode === "extract") {
        const pages = parseRange(pageRange, total);
        if (pages.length === 0) {
          throw new Error(`No valid pages. PDF has ${total} pages.`);
        }

        setProgressLabel(`Extracting ${pages.length} pages...`);
        const outDoc = await PDFDocument.create();
        const copied = await outDoc.copyPages(source, pages.map((p) => p - 1));
        copied.forEach((p) => outDoc.addPage(p));
        setProgress(80);

        const outBytes = await outDoc.save();
        setProgress(100);
        const blob = new Blob([outBytes as BlobPart], { type: "application/pdf" });
        downloadBlob(blob, `${baseName}-pages.pdf`);
      } else {
        const chunkSize = parseInt(pageRange, 10);
        if (Number.isNaN(chunkSize) || chunkSize < 1) {
          throw new Error("Enter a valid chunk size.");
        }
        const totalChunks = Math.ceil(total / chunkSize);
        for (let c = 0; c < totalChunks; c++) {
          setProgressLabel(`Creating chunk ${c + 1} of ${totalChunks}...`);
          const outDoc = await PDFDocument.create();
          const start = c * chunkSize;
          const end = Math.min(start + chunkSize, total);
          const indices: number[] = [];
          for (let i = start; i < end; i++) indices.push(i);
          const copied = await outDoc.copyPages(source, indices);
          copied.forEach((p) => outDoc.addPage(p));
          const outBytes = await outDoc.save();
          const blob = new Blob([outBytes as BlobPart], { type: "application/pdf" });
          downloadBlob(blob, `${baseName}-part-${String(c + 1).padStart(2, "0")}.pdf`);
          setProgress(Math.round(((c + 1) / totalChunks) * 100));
          if (c < totalChunks - 1) await new Promise((r) => setTimeout(r, 250));
        }
      }

      setProgressLabel("Done!");
      setTimeout(() => {
        setProcessing(false);
        setProgress(0);
        setProgressLabel("");
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to split PDF.");
      setProcessing(false);
      setProgress(0);
      setProgressLabel("");
    }
  };

  const modes: { value: SplitMode; label: string; desc: string }[] = [
    { value: "range", label: "Page Range", desc: "Extract a range of pages (e.g. 1-5)" },
    { value: "extract", label: "Extract Pages", desc: "Pick specific pages (e.g. 1,3,5)" },
    { value: "every", label: "Split Every N", desc: "Split into chunks of N pages" },
  ];

  return (
    <ToolPage
      icon={Scissors}
      iconColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
      title="Split PDF"
      description="Extract pages or split a PDF into multiple smaller files."
    >
      {!file ? (
        <Dropzone accept=".pdf" multiple={false} onFiles={handleFiles} />
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <FileText className="h-5 w-5 text-blue-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Change
          </button>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Split Mode</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                mode === m.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{m.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {mode === "range" ? "Page Range" : mode === "extract" ? "Page Numbers" : "Pages per chunk"}
        </label>
        <input
          type="text"
          value={pageRange}
          onChange={(e) => setPageRange(e.target.value)}
          placeholder={mode === "range" ? "e.g. 1-5" : mode === "extract" ? "e.g. 1,3,5,8" : "e.g. 2"}
          className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {processing && <ProgressBar progress={progress} label={progressLabel} />}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/20 dark:bg-red-500/5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <p className="text-xs leading-relaxed text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <button
        onClick={handleSplit}
        disabled={!file || !pageRange.trim() || processing}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DownloadIcon className="h-4 w-4" />
        {processing ? "Splitting..." : "Split PDF"}
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
