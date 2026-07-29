"use client";

import { useEffect, useCallback } from "react";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageLightboxProps {
  images: { url: string; alt?: string }[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onNavigate?: (index: number) => void;
}

export function ImageLightbox({
  images,
  currentIndex,
  open,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0)
        onNavigate?.(currentIndex - 1);
      if (e.key === "ArrowRight" && currentIndex < images.length - 1)
        onNavigate?.(currentIndex + 1);
    },
    [open, currentIndex, images.length, onClose, onNavigate],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || images.length === 0) return null;

  const current = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/10"
        aria-label="Close"
      >
        <X className="size-6" />
      </Button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Navigation arrows */}
      {hasPrev && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate?.(currentIndex - 1)}
          className="absolute left-4 z-10 text-white hover:bg-white/10"
          aria-label="Previous image"
        >
          <ChevronLeft className="size-8" />
        </Button>
      )}
      {hasNext && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate?.(currentIndex + 1)}
          className="absolute right-4 z-10 text-white hover:bg-white/10"
          aria-label="Next image"
        >
          <ChevronRight className="size-8" />
        </Button>
      )}

      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.url}
        alt={current.alt ?? "Image"}
        className="max-h-[85vh] max-w-[90vw] object-contain"
      />

      {/* Download button */}
      <a
        href={current.url}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="absolute bottom-4 right-4 z-10"
      >
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <Download className="size-5" />
        </Button>
      </a>
    </div>
  );
}
