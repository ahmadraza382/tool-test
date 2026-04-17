export interface FileWithPreview extends File {
  preview?: string;
}

export interface ProcessingState {
  status: "idle" | "processing" | "done" | "error";
  progress: number;
  message?: string;
}
