"use client";

import { useState } from "react";
import {
  FileImage,
  Download as DownloadIcon,
  AlertTriangle,
} from "lucide-react";
import { ToolPage } from "@/components/ToolPage";
import { Dropzone } from "@/components/Dropzone";
import { ProgressBar } from "@/components/ProgressBar";

export default function SvgToPngPage() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(2);
  const [bgColor, setBgColor] = useState("transparent");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    const svg = files.find(
      (f) => f.type === "image/svg+xml" || f.name.endsWith(".svg")
    );
    if (svg) {
      setFile(svg);
      setError(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(10);
    setError(null);

    try {
      const svgText = await file.text();
      setProgress(30);

      // Parse SVG to get natural dimensions
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
      const svgEl = svgDoc.documentElement;
      if (!svgEl || svgEl.tagName === "parsererror") {
        throw new Error("Invalid SVG file.");
      }

      // Determine base dimensions
      let baseW =
        parseFloat(svgEl.getAttribute("width") ?? "") ||
        (svgEl.getAttribute("viewBox")?.split(/\s+/)?.[2]
          ? parseFloat(svgEl.getAttribute("viewBox")!.split(/\s+/)[2])
          : 512);
      let baseH =
        parseFloat(svgEl.getAttribute("height") ?? "") ||
        (svgEl.getAttribute("viewBox")?.split(/\s+/)?.[3]
          ? parseFloat(svgEl.getAttribute("viewBox")!.split(/\s+/)[3])
          : 512);
      if (!baseW || Number.isNaN(baseW)) baseW = 512;
      if (!baseH || Number.isNaN(baseH)) baseH = 512;

      const outW = Math.round(baseW * scale);
      const outH = Math.round(baseH * scale);

      setProgress(50);

      // Render SVG via image + canvas
      const blob = new Blob([svgText], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Failed to render SVG."));
        image.src = url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      if (bgColor !== "transparent") {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, outW, outH);
      }
      ctx.drawImage(img, 0, 0, outW, outH);

      URL.revokeObjectURL(url);
      setProgress(80);

      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
          "image/png"
        );
      });
      setProgress(100);

      const baseName = file.name.replace(/\.svg$/i, "");
      downloadBlob(pngBlob, `${baseName}.png`);

      setTimeout(() => {
        setProcessing(false);
        setProgress(0);
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to convert SVG.");
      setProcessing(false);
      setProgress(0);
    }
  };

  return (
    <ToolPage
      icon={FileImage}
      iconColor="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
      title="SVG to PNG"
      description="Convert SVG vector files to high-quality PNG raster images."
    >
      {!file ? (
        <Dropzone
          accept=".svg,image/svg+xml"
          multiple={false}
          onFiles={handleFiles}
        >
          <div className="flex flex-col items-center gap-2 py-4">
            <FileImage className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Drop an SVG file here
            </p>
          </div>
        </Dropzone>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <FileImage className="h-5 w-5 text-cyan-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
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

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Scale: {scale}x</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
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

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Background</h3>
        <div className="flex gap-2">
          {[
            { value: "transparent", label: "Transparent" },
            { value: "#ffffff", label: "White" },
            { value: "#000000", label: "Black" },
          ].map((bg) => (
            <button
              key={bg.value}
              onClick={() => setBgColor(bg.value)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                bgColor === bg.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {bg.label}
            </button>
          ))}
        </div>
      </div>

      {processing && <ProgressBar progress={progress} label="Converting..." />}

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
        {processing ? "Converting..." : "Convert to PNG"}
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
