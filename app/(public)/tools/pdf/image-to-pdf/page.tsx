"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Images,
  ImageIcon,
  GripVertical,
  Trash2,
  Download as DownloadIcon,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { ToolPage } from "@/components/ToolPage";
import { Dropzone } from "@/components/Dropzone";
import { ProgressBar } from "@/components/ProgressBar";

type PageSize = "auto" | "a4" | "letter" | "legal" | "fit";
type Orientation = "portrait" | "landscape" | "auto";
type Margin = "none" | "small" | "medium" | "large";

// Page sizes in points (1 inch = 72 points)
const PAGE_SIZES: Record<Exclude<PageSize, "fit" | "auto">, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008],
};

const MARGIN_VALUES: Record<Margin, number> = {
  none: 0,
  small: 18,
  medium: 36,
  large: 72,
};

export default function ImageToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("auto");
  const [orientation, setOrientation] = useState<Orientation>("auto");
  const [margin, setMargin] = useState<Margin>("small");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const previews = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    [files]
  );

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const addFiles = (newFiles: File[]) => {
    setFiles((prev) => [
      ...prev,
      ...newFiles.filter(
        (f) =>
          f.type === "image/jpeg" ||
          f.type === "image/png" ||
          f.type === "image/webp" ||
          f.type === "image/jpg"
      ),
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

  const handleConvert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      setProgressLabel("Loading library...");
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const marginVal = MARGIN_VALUES[margin];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgressLabel(`Embedding image ${i + 1} of ${files.length}...`);

        const bytes = new Uint8Array(await file.arrayBuffer());
        const isWebP = file.type === "image/webp";

        // pdf-lib supports JPG and PNG natively. For WebP we convert via canvas.
        let embedded;
        if (isWebP) {
          const pngBytes = await webpToPng(file);
          embedded = await pdfDoc.embedPng(pngBytes);
        } else if (
          file.type === "image/jpeg" ||
          file.type === "image/jpg"
        ) {
          embedded = await pdfDoc.embedJpg(bytes);
        } else {
          embedded = await pdfDoc.embedPng(bytes);
        }

        // Determine page dimensions
        let pageW: number;
        let pageH: number;

        if (pageSize === "fit") {
          pageW = embedded.width + marginVal * 2;
          pageH = embedded.height + marginVal * 2;
        } else {
          // "auto" uses A4 as the base + auto orientation
          const baseKey = pageSize === "auto" ? "a4" : pageSize;
          const [baseW, baseH] = PAGE_SIZES[baseKey];
          let w = baseW;
          let h = baseH;

          // When pageSize is "auto", always auto-orient by image; otherwise honor selection
          const effectiveOrientation =
            pageSize === "auto" ? "auto" : orientation;

          const useLandscape =
            effectiveOrientation === "landscape" ||
            (effectiveOrientation === "auto" &&
              embedded.width > embedded.height);

          if (useLandscape && h > w) {
            [w, h] = [h, w];
          } else if (effectiveOrientation === "portrait" && w > h) {
            [w, h] = [h, w];
          }

          pageW = w;
          pageH = h;
        }

        const page = pdfDoc.addPage([pageW, pageH]);

        // Fit image within page minus margins, preserving aspect ratio
        const availW = pageW - marginVal * 2;
        const availH = pageH - marginVal * 2;
        const scale = Math.min(
          availW / embedded.width,
          availH / embedded.height
        );
        const drawW = embedded.width * scale;
        const drawH = embedded.height * scale;
        const x = (pageW - drawW) / 2;
        const y = (pageH - drawH) / 2;

        page.drawImage(embedded, { x, y, width: drawW, height: drawH });

        setProgress(Math.round(((i + 1) / files.length) * 90));
      }

      setProgressLabel("Finalizing PDF...");
      const pdfBytes = await pdfDoc.save();
      setProgress(100);

      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const baseName =
        files.length === 1
          ? files[0].name.replace(/\.[^.]+$/, "")
          : "images";
      downloadBlob(blob, `${baseName}.pdf`);

      setProgressLabel("Done!");
      setTimeout(() => {
        setProcessing(false);
        setProgress(0);
        setProgressLabel("");
      }, 800);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to create PDF."
      );
      setProcessing(false);
      setProgress(0);
      setProgressLabel("");
    }
  };

  const pageSizes: { value: PageSize; label: string }[] = [
    { value: "auto", label: "Auto" },
    { value: "a4", label: "A4" },
    { value: "letter", label: "Letter" },
    { value: "legal", label: "Legal" },
    { value: "fit", label: "Fit Image" },
  ];

  const orientations: { value: Orientation; label: string }[] = [
    { value: "portrait", label: "Portrait" },
    { value: "landscape", label: "Landscape" },
    { value: "auto", label: "Auto" },
  ];

  const margins: { value: Margin; label: string }[] = [
    { value: "none", label: "None" },
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ];

  return (
    <ToolPage
      icon={Images}
      iconColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
      title="Image to PDF"
      description="Combine JPG, PNG, and WebP images into a single PDF document."
    >
      <Dropzone
        accept="image/jpeg,image/png,image/webp"
        onFiles={addFiles}
      >
        <div className="flex flex-col items-center gap-2 py-4">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Drop images here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports JPG, PNG, WebP — add as many as you want
          </p>
        </div>
      </Dropzone>

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">
            {files.length} image{files.length !== 1 && "s"}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              (use arrows to reorder)
            </span>
          </h3>
          <div className="space-y-1.5">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-2 sm:px-3"
              >
                <GripVertical className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
                {/* Thumbnail preview */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previews[i]}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-md border border-border object-cover"
                />
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
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveFile(i, 1)}
                  disabled={i === files.length - 1}
                  aria-label="Move down"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
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

      {/* Page size */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Page Size</h3>
        <div className="flex flex-wrap gap-2">
          {pageSizes.map((p) => (
            <button
              key={p.value}
              onClick={() => setPageSize(p.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                pageSize === p.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orientation */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Orientation</h3>
        <div className="flex gap-2">
          {orientations.map((o) => (
            <button
              key={o.value}
              onClick={() => setOrientation(o.value)}
              disabled={pageSize === "fit" || pageSize === "auto"}
              className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                orientation === o.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Margin */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Margin</h3>
        <div className="flex gap-2">
          {margins.map((m) => (
            <button
              key={m.value}
              onClick={() => setMargin(m.value)}
              className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                margin === m.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
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
        onClick={handleConvert}
        disabled={files.length === 0 || processing}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DownloadIcon className="h-4 w-4" />
        {processing
          ? "Creating PDF..."
          : files.length > 0
            ? `Create PDF from ${files.length} Image${files.length !== 1 ? "s" : ""}`
            : "Create PDF"}
      </button>
    </ToolPage>
  );
}

async function webpToPng(file: File): Promise<Uint8Array> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load WebP: ${file.name}`));
      image.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.drawImage(img, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("WebP conversion failed"))),
        "image/png"
      );
    });
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(url);
  }
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
