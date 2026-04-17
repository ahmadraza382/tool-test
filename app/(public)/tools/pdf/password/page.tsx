"use client";

import { useState } from "react";
import {
  Lock,
  FileText,
  Eye,
  EyeOff,
  Download as DownloadIcon,
  AlertTriangle,
} from "lucide-react";
import { ToolPage } from "@/components/ToolPage";
import { Dropzone } from "@/components/Dropzone";
import { ProgressBar } from "@/components/ProgressBar";

export default function PasswordPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [allowPrint, setAllowPrint] = useState(true);
  const [allowCopy, setAllowCopy] = useState(true);
  const [allowEdit, setAllowEdit] = useState(false);
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

  const handleProtect = async () => {
    if (!file || !password) return;
    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      setProgressLabel("Loading PDF...");
      const { PDFDocument } = await import("@cantoo/pdf-lib");
      const bytes = new Uint8Array(await file.arrayBuffer());
      setProgress(25);

      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setProgress(50);
      setProgressLabel("Applying password protection...");

      // Encrypt with user + owner password. Permissions control what users can do.
      pdf.encrypt({
        userPassword: password,
        ownerPassword: password,
        permissions: {
          printing: allowPrint ? "highResolution" : undefined,
          modifying: allowEdit,
          copying: allowCopy,
          annotating: allowEdit,
          fillingForms: allowEdit,
          contentAccessibility: true,
          documentAssembly: allowEdit,
        },
      });

      setProgress(80);
      setProgressLabel("Saving PDF...");
      const outBytes = await pdf.save();
      setProgress(100);

      const blob = new Blob([outBytes as BlobPart], {
        type: "application/pdf",
      });
      const baseName = file.name.replace(/\.pdf$/i, "");
      downloadBlob(blob, `${baseName}-protected.pdf`);

      setProgressLabel("Done!");
      setTimeout(() => {
        setProcessing(false);
        setProgress(0);
        setProgressLabel("");
      }, 800);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to protect PDF."
      );
      setProcessing(false);
      setProgress(0);
      setProgressLabel("");
    }
  };

  return (
    <ToolPage
      icon={Lock}
      iconColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
      title="Protect PDF"
      description="Add password protection to your PDF files."
    >
      {!file ? (
        <Dropzone accept=".pdf" multiple={false} onFiles={handleFiles} />
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <FileText className="h-5 w-5 text-blue-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{file.name}</p>
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

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a strong password"
            className="h-10 w-full rounded-lg border border-border bg-card px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Use a mix of letters, numbers, and symbols for best security.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Permissions</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={allowPrint}
              onChange={(e) => setAllowPrint(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            Allow printing
          </label>
          <label className="flex items-center gap-2.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={allowCopy}
              onChange={(e) => setAllowCopy(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            Allow copying text
          </label>
          <label className="flex items-center gap-2.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={allowEdit}
              onChange={(e) => setAllowEdit(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            Allow editing
          </label>
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
        onClick={handleProtect}
        disabled={!file || !password || processing}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DownloadIcon className="h-4 w-4" />
        {processing ? "Encrypting..." : "Protect PDF"}
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
