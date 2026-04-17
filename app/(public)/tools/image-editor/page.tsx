"use client";

import { useEffect, useRef, useState } from "react";
import {
  Crop,
  ImageIcon,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  RotateCcw,
  Sun,
  Contrast,
  Droplets,
  Download as DownloadIcon,
  AlertTriangle,
} from "lucide-react";
import { ToolPage } from "@/components/ToolPage";
import { Dropzone } from "@/components/Dropzone";
import { cn } from "@/lib/cn";

type Tab = "resize" | "adjust" | "transform";

export default function ImageEditorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("resize");
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [keepRatio, setKeepRatio] = useState(true);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFiles = (files: File[]) => {
    const img = files.find((f) => f.type.startsWith("image/"));
    if (img) {
      if (preview) URL.revokeObjectURL(preview);
      setFile(img);
      setPreview(URL.createObjectURL(img));
      setError(null);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setWidth("");
      setHeight("");
    }
  };

  const onImgLoad = () => {
    if (imgRef.current) {
      const w = imgRef.current.naturalWidth;
      const h = imgRef.current.naturalHeight;
      setNatural({ w, h });
      setWidth(String(w));
      setHeight(String(h));
    }
  };

  const updateWidth = (v: string) => {
    setWidth(v);
    if (keepRatio && natural && v) {
      const n = parseInt(v, 10);
      if (!Number.isNaN(n)) setHeight(String(Math.round((n / natural.w) * natural.h)));
    }
  };

  const updateHeight = (v: string) => {
    setHeight(v);
    if (keepRatio && natural && v) {
      const n = parseInt(v, 10);
      if (!Number.isNaN(n)) setWidth(String(Math.round((n / natural.h) * natural.w)));
    }
  };

  const handleApply = async () => {
    if (!file || !imgRef.current || !natural) return;
    setProcessing(true);
    setError(null);

    try {
      const srcW = natural.w;
      const srcH = natural.h;
      const outW = parseInt(width, 10) || srcW;
      const outH = parseInt(height, 10) || srcH;

      const rotated90 = rotation === 90 || rotation === 270;
      const finalW = rotated90 ? outH : outW;
      const finalH = rotated90 ? outW : outH;

      const canvas = document.createElement("canvas");
      canvas.width = finalW;
      canvas.height = finalH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.translate(finalW / 2, finalH / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(imgRef.current, -outW / 2, -outH / 2, outW, outH);

      const isPng = file.type === "image/png";
      const mime = isPng ? "image/png" : "image/jpeg";
      const q = isPng ? undefined : 0.92;

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), mime, q);
      });

      const baseName = file.name.replace(/\.[^.]+$/, "");
      const ext = isPng ? "png" : "jpg";
      downloadBlob(blob, `${baseName}-edited.${ext}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to process image.");
    } finally {
      setProcessing(false);
    }
  };

  const tabs: { value: Tab; label: string }[] = [
    { value: "resize", label: "Resize" },
    { value: "adjust", label: "Adjust" },
    { value: "transform", label: "Transform" },
  ];

  return (
    <ToolPage
      icon={Crop}
      iconColor="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
      title="Image Editor"
      description="Resize, adjust, flip and rotate your images."
    >
      {!file ? (
        <Dropzone accept="image/*" multiple={false} onFiles={handleFiles}>
          <div className="flex flex-col items-center gap-2 py-4">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Drop an image here to start editing
            </p>
          </div>
        </Dropzone>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <span className="truncate text-sm font-medium text-foreground">{file.name}</span>
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setError(null);
                }}
                className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
              >
                Change image
              </button>
            </div>
            <div className="flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={preview!}
                alt="Preview"
                onLoad={onImgLoad}
                className="max-h-64 rounded-md object-contain"
                style={{
                  filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                  transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                }}
              />
            </div>
          </div>

          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  tab === t.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "resize" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Width (px)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => updateWidth(e.target.value)}
                    placeholder="Auto"
                    className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Height (px)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => updateHeight(e.target.value)}
                    placeholder="Auto"
                    className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={keepRatio}
                  onChange={(e) => setKeepRatio(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary"
                />
                Keep aspect ratio
              </label>
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Quick presets</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { w: "1920", h: "1080", label: "1080p" },
                    { w: "1280", h: "720", label: "720p" },
                    { w: "800", h: "600", label: "800x600" },
                    { w: "500", h: "500", label: "Square" },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        setKeepRatio(false);
                        setWidth(p.w);
                        setHeight(p.h);
                      }}
                      className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "adjust" && (
            <div className="space-y-4">
              {[
                { icon: Sun, label: "Brightness", value: brightness, set: setBrightness },
                { icon: Contrast, label: "Contrast", value: contrast, set: setContrast },
                { icon: Droplets, label: "Saturation", value: saturation, set: setSaturation },
              ].map(({ icon: Icon, label, value, set }) => (
                <div key={label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Icon className="h-4 w-4" />
                      {label}
                    </div>
                    <span className="text-xs text-muted-foreground">{value}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={value}
                    onChange={(e) => set(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  setBrightness(100);
                  setContrast(100);
                  setSaturation(100);
                }}
                className="text-xs font-medium text-primary hover:underline"
              >
                Reset all
              </button>
            </div>
          )}

          {tab === "transform" && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                <RotateCw className="h-5 w-5" />
                <span className="text-xs font-medium">Rotate 90° CW</span>
              </button>
              <button
                onClick={() => setRotation((r) => (r + 270) % 360)}
                className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                <RotateCcw className="h-5 w-5" />
                <span className="text-xs font-medium">Rotate 90° CCW</span>
              </button>
              <button
                onClick={() => setFlipH((v) => !v)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors",
                  flipH
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                )}
              >
                <FlipHorizontal className="h-5 w-5" />
                <span className="text-xs font-medium">Flip Horizontal</span>
              </button>
              <button
                onClick={() => setFlipV((v) => !v)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors",
                  flipV
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                )}
              >
                <FlipVertical className="h-5 w-5" />
                <span className="text-xs font-medium">Flip Vertical</span>
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/20 dark:bg-red-500/5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-xs leading-relaxed text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={processing}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <DownloadIcon className="h-4 w-4" />
            {processing ? "Processing..." : "Apply & Download"}
          </button>
        </div>
      )}
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
