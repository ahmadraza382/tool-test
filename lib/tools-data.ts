import {
  FileText,
  Scissors,
  Minimize2,
  Image,
  Images,
  RotateCw,
  Lock,
  ImageIcon,
  Crop,
  FileImage,
  Sparkles,
  Eraser,
  type LucideIcon,
} from "lucide-react";

export interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  category: "pdf" | "image" | "ai";
  color: string;
}

export const tools: Tool[] = [
  {
    id: "pdf-merge",
    name: "Merge PDF",
    description: "Combine multiple PDF files into one document",
    href: "/tools/pdf/merge",
    icon: FileText,
    category: "pdf",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: "pdf-split",
    name: "Split PDF",
    description: "Extract pages or split a PDF into multiple files",
    href: "/tools/pdf/split",
    icon: Scissors,
    category: "pdf",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: "pdf-compress",
    name: "Compress PDF",
    description: "Reduce PDF file size while maintaining quality",
    href: "/tools/pdf/compress",
    icon: Minimize2,
    category: "pdf",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: "pdf-convert",
    name: "PDF to Images",
    description: "Convert PDF pages to JPG or PNG images",
    href: "/tools/pdf/convert",
    icon: Image,
    category: "pdf",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    description: "Combine JPG, PNG, and WebP images into a single PDF",
    href: "/tools/pdf/image-to-pdf",
    icon: Images,
    category: "pdf",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: "pdf-rotate",
    name: "Rotate PDF",
    description: "Rotate PDF pages to any orientation",
    href: "/tools/pdf/rotate",
    icon: RotateCw,
    category: "pdf",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: "pdf-password",
    name: "Protect PDF",
    description: "Add password protection to your PDF files",
    href: "/tools/pdf/password",
    icon: Lock,
    category: "pdf",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: "image-converter",
    name: "Image Converter",
    description: "Convert between JPG, PNG, WebP and more formats",
    href: "/tools/image-converter",
    icon: ImageIcon,
    category: "image",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "image-editor",
    name: "Image Editor",
    description: "Resize, crop, compress, flip and rotate images",
    href: "/tools/image-editor",
    icon: Crop,
    category: "image",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "svg-to-png",
    name: "SVG to PNG",
    description: "Convert SVG vector files to PNG raster images",
    href: "/tools/svg-to-png",
    icon: FileImage,
    category: "image",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "bg-remover",
    name: "Background Remover",
    description: "Remove image backgrounds using AI — 100% in browser",
    href: "/tools/bg-remover",
    icon: Sparkles,
    category: "ai",
    color: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  {
    id: "object-remover",
    name: "Object Remover",
    description: "Remove unwanted objects, people or watermarks from images",
    href: "/tools/object-remover",
    icon: Eraser,
    category: "ai",
    color: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
];

export const categories = [
  { id: "all", label: "All Tools" },
  { id: "pdf", label: "PDF Tools" },
  { id: "image", label: "Image Tools" },
  { id: "ai", label: "AI Tools" },
] as const;
