"use client";

import { useEffect, useRef, useState } from "react";
import {
  Eraser,
  ImageIcon,
  Paintbrush,
  MousePointer,
  Download as DownloadIcon,
  AlertTriangle,
  Undo,
} from "lucide-react";
import { ToolPage } from "@/components/ToolPage";
import { Dropzone } from "@/components/Dropzone";
import { ProgressBar } from "@/components/ProgressBar";
import { cn } from "@/lib/cn";

type BrushSize = "small" | "medium" | "large";

const BRUSH_RADII: Record<BrushSize, number> = {
  small: 10,
  medium: 25,
  large: 45,
};

export default function ObjectRemoverPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState<BrushSize>("medium");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasMask, setHasMask] = useState(false);

  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const drawingRef = useRef(false);

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
      setHasMask(false);
      setError(null);
    }
  };

  // Load image into the image canvas
  useEffect(() => {
    if (!preview || !imageCanvasRef.current || !maskCanvasRef.current) return;

    const img = new window.Image();
    img.onload = () => {
      imgRef.current = img;
      const maxDim = 800;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const imgCanvas = imageCanvasRef.current!;
      const maskCanvas = maskCanvasRef.current!;
      imgCanvas.width = w;
      imgCanvas.height = h;
      maskCanvas.width = w;
      maskCanvas.height = h;

      const ctx = imgCanvas.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0, w, h);

      const mctx = maskCanvas.getContext("2d");
      if (mctx) mctx.clearRect(0, 0, w, h);
      setHasMask(false);
    };
    img.src = preview;
  }, [preview]);

  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = maskCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const paintAt = (x: number, y: number) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const radius = BRUSH_RADII[brushSize];
    ctx.fillStyle = "rgba(14, 165, 233, 0.55)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    setHasMask(true);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = true;
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    const { x, y } = getPointerPos(e);
    paintAt(x, y);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const { x, y } = getPointerPos(e);
    paintAt(x, y);
  };

  const onPointerUp = () => {
    drawingRef.current = false;
  };

  const clearMask = () => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasMask(false);
  };

  const handleRemove = async () => {
    if (!imgRef.current || !imageCanvasRef.current || !maskCanvasRef.current) {
      return;
    }
    setProcessing(true);
    setProgress(5);
    setError(null);

    try {
      const imgCanvas = imageCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      const w = imgCanvas.width;
      const h = imgCanvas.height;

      const imgCtx = imgCanvas.getContext("2d");
      const maskCtx = maskCanvas.getContext("2d");
      if (!imgCtx || !maskCtx) throw new Error("Canvas not ready");

      const imgData = imgCtx.getImageData(0, 0, w, h);
      const maskData = maskCtx.getImageData(0, 0, w, h);
      setProgress(20);

      // Identify masked pixels (alpha > 0 in mask)
      const maskSet = new Set<number>();
      for (let i = 0; i < maskData.data.length; i += 4) {
        if (maskData.data[i + 3] > 20) maskSet.add(i / 4);
      }

      if (maskSet.size === 0) {
        throw new Error("Paint over the object to remove first.");
      }

      setProgress(35);
      // Simple inpainting: for each masked pixel, sample from nearest
      // unmasked pixels using expanding search radius and average.
      const out = new Uint8ClampedArray(imgData.data);
      const maskedIndices = Array.from(maskSet);
      const total = maskedIndices.length;
      let done = 0;

      for (const idx of maskedIndices) {
        const px = idx % w;
        const py = Math.floor(idx / w);

        let r = 0,
          g = 0,
          b = 0,
          count = 0;

        // Expanding ring search up to 50px radius
        for (let radius = 2; radius <= 50 && count < 12; radius += 3) {
          for (let dy = -radius; dy <= radius; dy += 2) {
            for (let dx = -radius; dx <= radius; dx += 2) {
              const nx = px + dx;
              const ny = py + dy;
              if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
              const nIdx = ny * w + nx;
              if (maskSet.has(nIdx)) continue;
              const off = nIdx * 4;
              r += imgData.data[off];
              g += imgData.data[off + 1];
              b += imgData.data[off + 2];
              count++;
              if (count >= 12) break;
            }
            if (count >= 12) break;
          }
        }

        if (count > 0) {
          const off = idx * 4;
          out[off] = Math.round(r / count);
          out[off + 1] = Math.round(g / count);
          out[off + 2] = Math.round(b / count);
        }

        done++;
        if (done % 500 === 0) {
          const pct = 35 + Math.round((done / total) * 50);
          setProgress(Math.min(85, pct));
          // Yield to UI
          await new Promise((r) => setTimeout(r, 0));
        }
      }

      setProgress(90);
      const resultCanvas = document.createElement("canvas");
      resultCanvas.width = w;
      resultCanvas.height = h;
      const rctx = resultCanvas.getContext("2d");
      if (!rctx) throw new Error("Canvas unavailable");
      rctx.putImageData(new ImageData(out, w, h), 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        resultCanvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
          "image/png"
        );
      });

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setProgress(100);

      setTimeout(() => {
        setProcessing(false);
        setProgress(0);
      }, 600);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to process image.");
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    const baseName = file.name.replace(/\.[^.]+$/, "");
    a.download = `${baseName}-removed.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const brushSizes: { value: BrushSize; label: string; size: number }[] = [
    { value: "small", label: "Small", size: 10 },
    { value: "medium", label: "Medium", size: 25 },
    { value: "large", label: "Large", size: 45 },
  ];

  return (
    <ToolPage
      icon={Eraser}
      iconColor="bg-sky-500/10 text-sky-600 dark:text-sky-400"
      title="Object Remover"
      description="Paint over objects to remove them from images."
    >
      {!file ? (
        <Dropzone accept="image/*" multiple={false} onFiles={handleFiles}>
          <div className="flex flex-col items-center gap-2 py-6">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Drop an image here
            </p>
            <p className="text-xs text-muted-foreground">
              Then paint over objects you want removed
            </p>
          </div>
        </Dropzone>
      ) : (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Paintbrush className="h-4 w-4" />
              Brush:
            </div>
            <div className="flex gap-1.5">
              {brushSizes.map((b) => (
                <button
                  key={b.value}
                  onClick={() => setBrushSize(b.value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    brushSize === b.value
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span
                    className="rounded-full bg-current"
                    style={{
                      width: `${b.size / 4}px`,
                      height: `${b.size / 4}px`,
                    }}
                  />
                  {b.label}
                </button>
              ))}
            </div>
            <button
              onClick={clearMask}
              disabled={!hasMask}
              className="ml-auto flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Undo className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>

          {/* Canvas area */}
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <span className="text-sm font-medium text-foreground">
                {resultUrl ? "Result" : file.name}
              </span>
              <button
                onClick={() => {
                  if (preview) URL.revokeObjectURL(preview);
                  if (resultUrl) URL.revokeObjectURL(resultUrl);
                  setFile(null);
                  setPreview(null);
                  setResultUrl(null);
                  setError(null);
                  setHasMask(false);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Change image
              </button>
            </div>
            <div className="relative flex items-center justify-center bg-muted/30 p-4">
              {resultUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={resultUrl}
                  alt="Result"
                  className="max-h-80 rounded-md object-contain"
                />
              ) : (
                <div className="relative">
                  <canvas
                    ref={imageCanvasRef}
                    className="max-h-80 rounded-md"
                  />
                  <canvas
                    ref={maskCanvasRef}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    className="absolute inset-0 max-h-80 cursor-crosshair touch-none rounded-md"
                  />
                  {!hasMask && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-2 rounded-lg bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                        <MousePointer className="h-3 w-3" />
                        Paint over objects to remove
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {processing && <ProgressBar progress={progress} label="Processing..." />}

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
                  clearMask();
                }}
                className="h-11 rounded-xl border border-border px-5 font-medium text-foreground transition-colors hover:bg-accent"
              >
                Edit More
              </button>
            </div>
          ) : (
            <button
              onClick={handleRemove}
              disabled={!hasMask || processing}
              className="h-11 w-full rounded-xl bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing
                ? "Processing..."
                : hasMask
                  ? "Remove Selected Objects"
                  : "Paint over objects first"}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  );
}
