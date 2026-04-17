"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ImageIcon,
  X,
  Download as DownloadIcon,
  AlertTriangle,
} from "lucide-react";
import { ToolPage } from "@/components/ToolPage";
import { Dropzone } from "@/components/Dropzone";
import { ProgressBar } from "@/components/ProgressBar";

type Format = "jpg" | "png" | "webp";

const MIME: Record<Format, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export default function ImageConverterPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<Format>("png");
  const [quality, setQuality] = useState(90);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const previews = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    [files]
  );

  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  const addFiles = (newFiles: File[]) => {
    setFiles((prev) => [
      ...prev,
      ...newFiles.filter((f) => f.type.startsWith("image/")),
    ]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formats: Format[] = ["jpg", "png", "webp"];

  const handleConvert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgressLabel(`Converting ${i + 1} of ${files.length}...`);

        const url = URL.createObjectURL(file);
        try {
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new window.Image();
            image.onload = () => resolve(image);
            image.onerror = () =>
              reject(new Error(`Failed to load: ${file.name}`));
            image.src = url;
          });

          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas context unavailable");

          // JPG requires opaque background
          if (format === "jpg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);

          const mime = MIME[format];
          const q = format === "png" ? undefined : quality / 100;

          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
              mime,
              q
            );
          });

          const baseName = file.name.replace(/\.[^.]+$/, "");
          downloadBlob(blob, `${baseName}.${format}`);
        } finally {
          URL.revokeObjectURL(url);
        }

        setProgress(Math.round(((i + 1) / files.length) * 100));
        if (i < files.length - 1) {
          await new Promise((r) => setTimeout(r, 250));
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
      setError(err instanceof Error ? err.message : "Failed to convert.");
      setProcessing(false);
      setProgress(0);
      setProgressLabel("");
    }
  };

  return (
    <ToolPage
      icon={ImageIcon}
      iconColor="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
      title="Image Converter"
      description="Convert between JPG, PNG, and WebP formats."
    >
      <Dropzone accept="image/*" onFiles={addFiles}>
        <div className="flex flex-col items-center gap-2 py-4">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Drop images here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports JPG, PNG, WebP, BMP, GIF
          </p>
        </div>
      </Dropzone>

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previews[i]}
                alt=""
                className="h-8 w-8 shrink-0 rounded border border-border object-cover"
              />
              <span className="flex-1 truncate text-sm text-foreground">
                {file.name}
              </span>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {(file.size / 1024).toFixed(0)} KB
              </span>
              <button
                onClick={() => removeFile(i)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Convert To</h3>
        <div className="flex flex-wrap gap-2">
          {formats.map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium uppercase transition-colors ${
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

      {(format === "jpg" || format === "webp") && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Quality: {quality}%
          </label>
          <input
            type="range"
            min={10}
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
        disabled={files.length === 0 || processing}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DownloadIcon className="h-4 w-4" />
        {processing
          ? "Converting..."
          : `Convert ${files.length} Image${files.length !== 1 ? "s" : ""}`}
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
