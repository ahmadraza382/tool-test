"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  ImageIcon,
  Download as DownloadIcon,
  AlertTriangle,
} from "lucide-react";
import { ToolPage } from "@/components/ToolPage";
import { Dropzone } from "@/components/Dropzone";
import { ProgressBar } from "@/components/ProgressBar";

export default function BgRemoverPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = (files: File[]) => {
    const img = files.find((f) => f.type.startsWith("image/"));
    if (img) {
      if (preview) URL.revokeObjectURL(preview);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setFile(img);
      setPreview(URL.createObjectURL(img));
      setResultUrl(null);
      setError(null);
    }
  };

  const handleRemove = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(5);
    setProgressLabel("Loading AI model (first use may download ~40MB)...");
    setError(null);

    try {
      const { removeBackground } = await import(
        "@imgly/background-removal"
      );

      setProgressLabel("Removing background...");
      setProgress(25);

      const blob = await removeBackground(file, {
        progress: (_key, current, total) => {
          // Scale 25-95 during model processing
          const pct = total > 0 ? (current / total) * 70 + 25 : 25;
          setProgress(Math.min(95, Math.round(pct)));
        },
      });

      setProgress(100);
      setProgressLabel("Done!");
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));

      setTimeout(() => {
        setProcessing(false);
        setProgress(0);
        setProgressLabel("");
      }, 600);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove background. Try again."
      );
      setProcessing(false);
      setProgress(0);
      setProgressLabel("");
    }
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    const baseName = file.name.replace(/\.[^.]+$/, "");
    a.download = `${baseName}-no-bg.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <ToolPage
      icon={Sparkles}
      iconColor="bg-sky-500/10 text-sky-600 dark:text-sky-400"
      title="AI Background Remover"
      description="Remove image backgrounds using AI."
    >
      {!file ? (
        <Dropzone accept="image/*" multiple={false} onFiles={handleFiles}>
          <div className="flex flex-col items-center gap-2 py-6">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Drop an image here to remove its background
            </p>
            <p className="text-xs text-muted-foreground">
              Works best with photos of people, products, and animals
            </p>
          </div>
        </Dropzone>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <span className="text-sm font-medium text-foreground">
                {resultUrl ? "Result" : "Original"}
              </span>
              <button
                onClick={() => {
                  if (preview) URL.revokeObjectURL(preview);
                  if (resultUrl) URL.revokeObjectURL(resultUrl);
                  setFile(null);
                  setPreview(null);
                  setResultUrl(null);
                  setError(null);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Change image
              </button>
            </div>
            <div
              className="flex items-center justify-center p-4"
              style={
                resultUrl
                  ? {
                      backgroundImage:
                        "repeating-conic-gradient(var(--border-color) 0% 25%, transparent 0% 50%)",
                      backgroundSize: "16px 16px",
                    }
                  : undefined
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resultUrl ?? preview!}
                alt="Preview"
                className="max-h-72 rounded-md object-contain"
              />
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

          {resultUrl ? (
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <DownloadIcon className="h-4 w-4" />
                Download PNG
              </button>
              <button
                onClick={() => {
                  if (resultUrl) URL.revokeObjectURL(resultUrl);
                  setResultUrl(null);
                }}
                className="h-11 rounded-xl border border-border px-5 font-medium text-foreground transition-colors hover:bg-accent"
              >
                Retry
              </button>
            </div>
          ) : (
            <button
              onClick={handleRemove}
              disabled={processing}
              className="h-11 w-full rounded-xl bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? "Processing..." : "Remove Background"}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  );
}
