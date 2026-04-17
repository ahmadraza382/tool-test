"use client";

import { useState } from "react";
import {
  Minimize2,
  FileText,
  Download as DownloadIcon,
  AlertTriangle,
} from "lucide-react";
import { ToolPage } from "@/components/ToolPage";
import { Dropzone } from "@/components/Dropzone";
import { ProgressBar } from "@/components/ProgressBar";

type Quality = "low" | "medium" | "high";

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<Quality>("medium");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<{ before: number; after: number } | null>(null);

  const handleFiles = (files: File[]) => {
    const pdf = files.find((f) => f.type === "application/pdf");
    if (pdf) {
      setFile(pdf);
      setError(null);
      setResultSize(null);
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setError(null);
    setResultSize(null);

    try {
      setProgressLabel("Loading PDF...");
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const { PDFDocument } = await import("pdf-lib");

      const originalBytes = new Uint8Array(await file.arrayBuffer());
      const sourcePdf = await pdfjs.getDocument({ data: originalBytes }).promise;
      const totalPages = sourcePdf.numPages;

      const scale = quality === "high" ? 2 : quality === "medium" ? 1.4 : 1;
      const jpegQuality = quality === "high" ? 0.9 : quality === "medium" ? 0.7 : 0.5;

      const newPdf = await PDFDocument.create();

      for (let i = 1; i <= totalPages; i++) {
        setProgressLabel(`Compressing page ${i} of ${totalPages}...`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const page = (await sourcePdf.getPage(i)) as any;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context unavailable");
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", jpegQuality);
        });
        const jpegBytes = new Uint8Array(await blob.arrayBuffer());
        const embedded = await newPdf.embedJpg(jpegBytes);

        const origPage = page.getViewport({ scale: 1 });
        const pdfPage = newPdf.addPage([origPage.width, origPage.height]);
        pdfPage.drawImage(embedded, { x: 0, y: 0, width: origPage.width, height: origPage.height });

        setProgress(Math.round((i / totalPages) * 90));
      }

      setProgressLabel("Finalizing PDF...");
      const outBytes = await newPdf.save();
      setProgress(100);

      const blob = new Blob([outBytes as BlobPart], { type: "application/pdf" });
      setResultSize({ before: file.size, after: blob.size });

      const baseName = file.name.replace(/\.pdf$/i, "");
      downloadBlob(blob, `${baseName}-compressed.pdf`);

      setProgressLabel("Done!");
      setTimeout(() => {
        setProcessing(false);
        setProgress(0);
        setProgressLabel("");
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to compress PDF.");
      setProcessing(false);
      setProgress(0);
      setProgressLabel("");
    }
  };

  const qualities: { value: Quality; label: string; desc: string }[] = [
    { value: "high", label: "High Quality", desc: "Less compression, best quality" },
    { value: "medium", label: "Balanced", desc: "Good compression, good quality" },
    { value: "low", label: "Maximum", desc: "Smallest file, reduced quality" },
  ];

  return (
    <ToolPage
      icon={Minimize2}
      iconColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
      title="Compress PDF"
      description="Reduce PDF file size while maintaining quality."
    >
      {!file ? (
        <Dropzone accept=".pdf" multiple={false} onFiles={handleFiles} />
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <FileText className="h-5 w-5 text-blue-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={() => {
              setFile(null);
              setError(null);
              setResultSize(null);
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Change
          </button>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Compression Level</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {qualities.map((q) => (
            <button
              key={q.value}
              onClick={() => setQuality(q.value)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                quality === q.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{q.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{q.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {processing && <ProgressBar progress={progress} label={progressLabel} />}

      {resultSize && (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-500/20 dark:bg-green-500/5">
          <p className="text-xs leading-relaxed text-green-700 dark:text-green-300">
            Compressed: {(resultSize.before / 1024 / 1024).toFixed(2)} MB →{" "}
            {(resultSize.after / 1024 / 1024).toFixed(2)} MB (
            {Math.round(((resultSize.before - resultSize.after) / resultSize.before) * 100)}% smaller)
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/20 dark:bg-red-500/5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <p className="text-xs leading-relaxed text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <button
        onClick={handleCompress}
        disabled={!file || processing}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DownloadIcon className="h-4 w-4" />
        {processing ? "Compressing..." : "Compress PDF"}
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
