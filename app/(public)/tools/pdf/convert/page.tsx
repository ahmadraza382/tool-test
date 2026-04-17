"use client";

import { useState } from "react";
import { Image, FileText, Download as DownloadIcon, AlertTriangle } from "lucide-react";
import { ToolPage } from "@/components/ToolPage";
import { Dropzone } from "@/components/Dropzone";
import { ProgressBar } from "@/components/ProgressBar";

type Format = "jpg" | "png";

export default function ConvertPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>("jpg");
  const [quality, setQuality] = useState(90);
  const [scale, setScale] = useState(2);
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

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      setProgressLabel("Loading PDF...");
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      const mime = format === "jpg" ? "image/jpeg" : "image/png";
      const qualityVal = format === "jpg" ? quality / 100 : undefined;
      const baseName = file.name.replace(/\.pdf$/i, "");

      if (totalPages === 1) {
        setProgressLabel(`Rendering page 1 of 1...`);
        setProgress(50);
        const blob = await renderPage(pdf, 1, scale, mime, qualityVal);
        setProgress(100);
        downloadBlob(blob, `${baseName}.${format}`);
      } else {
        for (let i = 1; i <= totalPages; i++) {
          setProgressLabel(
            `Rendering & downloading page ${i} of ${totalPages}...`
          );
          const blob = await renderPage(pdf, i, scale, mime, qualityVal);
          downloadBlob(
            blob,
            `${baseName}-page-${String(i).padStart(3, "0")}.${format}`
          );
          setProgress(Math.round((i / totalPages) * 100));
          // Brief pause so browser doesn't batch-block successive downloads
          if (i < totalPages) {
            await new Promise((r) => setTimeout(r, 250));
          }
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
      setError(
        err instanceof Error ? err.message : "Failed to convert PDF. Is the file valid?"
      );
      setProcessing(false);
      setProgress(0);
      setProgressLabel("");
    }
  };

  return (
    <ToolPage
      icon={Image}
      iconColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
      title="PDF to Images"
      description="Convert each PDF page into a high-quality image."
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
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Change
          </button>
        </div>
      )}

      {/* Options */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Output Format
          </label>
          <div className="flex gap-2">
            {(["jpg", "png"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium uppercase transition-colors ${
                  format === f
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Resolution (scale)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  scale === s
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {format === "jpg" && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Quality: {quality}%
          </label>
          <input
            type="range"
            min={30}
            max={100}
            step={5}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full accent-primary"
          />
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
        onClick={handleConvert}
        disabled={!file || processing}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DownloadIcon className="h-4 w-4" />
        {processing ? "Converting..." : "Convert to Images"}
      </button>
    </ToolPage>
  );
}

async function renderPage(
  pdf: { getPage: (n: number) => Promise<unknown> },
  pageNumber: number,
  scale: number,
  mime: string,
  quality: number | undefined
): Promise<Blob> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const page = (await pdf.getPage(pageNumber)) as any;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas to blob failed"))),
      mime,
      quality
    );
  });
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
