"use client";

import { useState } from "react";
import {
  FileText,
  GripVertical,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download as DownloadIcon,
  AlertTriangle,
} from "lucide-react";
import { ToolPage } from "@/components/ToolPage";
import { Dropzone } from "@/components/Dropzone";
import { ProgressBar } from "@/components/ProgressBar";

export default function MergePdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addFiles = (newFiles: File[]) => {
    setFiles((prev) => [
      ...prev,
      ...newFiles.filter((f) => f.type === "application/pdf"),
    ]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      setProgressLabel("Loading library...");
      const { PDFDocument } = await import("pdf-lib");
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        setProgressLabel(`Merging file ${i + 1} of ${files.length}...`);
        const bytes = new Uint8Array(await files[i].arrayBuffer());
        const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const copied = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copied.forEach((p) => mergedPdf.addPage(p));
        setProgress(Math.round(((i + 1) / files.length) * 90));
      }

      setProgressLabel("Finalizing PDF...");
      const pdfBytes = await mergedPdf.save();
      setProgress(100);

      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      downloadBlob(blob, "merged.pdf");

      setProgressLabel("Done!");
      setTimeout(() => {
        setProcessing(false);
        setProgress(0);
        setProgressLabel("");
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to merge PDFs.");
      setProcessing(false);
      setProgress(0);
      setProgressLabel("");
    }
  };

  return (
    <ToolPage
      icon={FileText}
      iconColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
      title="Merge PDF"
      description="Combine multiple PDF files into a single document. Drag to reorder."
    >
      <Dropzone accept=".pdf" onFiles={addFiles}>
        <div className="flex flex-col items-center gap-2 py-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Drop PDF files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Select 2 or more PDF files to merge
          </p>
        </div>
      </Dropzone>

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">
            {files.length} file{files.length !== 1 && "s"} selected
          </h3>
          <div className="space-y-1.5">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-2 sm:px-3"
              >
                <GripVertical className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
                <FileText className="h-4 w-4 shrink-0 text-blue-500" />
                <span className="flex-1 truncate text-sm text-foreground">
                  {file.name}
                </span>
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
                <button
                  onClick={() => moveFile(i, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveFile(i, 1)}
                  disabled={i === files.length - 1}
                  aria-label="Move down"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeFile(i)}
                  aria-label="Remove"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
        onClick={handleMerge}
        disabled={files.length < 2 || processing}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DownloadIcon className="h-4 w-4" />
        {processing ? "Merging..." : `Merge ${files.length} Files`}
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
