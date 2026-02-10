"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { ParsedReceipt } from "@/lib/validators/receipt";

interface ReceiptUploaderProps {
  projectId: string;
  currency: string;
  onParsed: (result: ParsedReceipt, thumbnail: string) => void;
}

const MAX_DIMENSION = 1024;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
        resolve(base64);
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ReceiptUploader({ projectId, currency, onParsed }: ReceiptUploaderProps) {
  const t = useTranslations("receipt");
  const inputRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("imageTooLarge"));
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error(t("parseError"));
      return;
    }

    setAnalyzing(true);
    try {
      const base64 = await resizeImage(file);
      const thumbnailUrl = `data:image/jpeg;base64,${base64.slice(0, 200)}`;
      // Keep full thumbnail for preview
      const fullThumb = URL.createObjectURL(file);

      const res = await fetch("/api/cost-entries/parse-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          projectId,
          userCurrency: currency,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.code || "PARSE_ERROR");
      }

      const { data } = await res.json();
      onParsed(data, fullThumb);
    } catch (error) {
      console.error("[ReceiptUploader]", error);
      toast.error(t("parseError"));
    } finally {
      setAnalyzing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [projectId, currency, onParsed, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  if (analyzing) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-primary">{t("analyzing")}</p>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed p-5 transition-colors ${
        dragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
      }`}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Camera className="size-5" />
        <Upload className="size-4" />
      </div>
      <p className="text-xs text-muted-foreground text-center">{t("dragDrop")}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
