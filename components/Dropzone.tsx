"use client";

import { useCallback, useState, type ReactNode } from "react";
import { Upload, FileUp } from "lucide-react";
import { cn } from "@/lib/cn";

interface DropzoneProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onFiles?: (files: File[]) => void;
  children?: ReactNode;
  className?: string;
}

export function Dropzone({
  accept,
  multiple = true,
  maxSizeMB = 50,
  onFiles,
  children,
  className,
}: DropzoneProps) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.size <= maxSizeMB * 1024 * 1024
      );
      onFiles?.(files);
    },
    [maxSizeMB, onFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      onFiles?.(files);
      e.target.value = "";
    },
    [onFiles]
  );

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-all duration-200",
        dragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/40 hover:bg-muted/50",
        className
      )}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="sr-only"
      />
      {children ?? (
        <>
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
              dragging ? "bg-primary/15" : "bg-muted"
            )}
          >
            {dragging ? (
              <FileUp className="h-6 w-6 text-primary" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">
              {dragging ? "Drop to upload" : "Drop files here or click to browse"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Max {maxSizeMB}MB per file
            </p>
          </div>
        </>
      )}
    </label>
  );
}
