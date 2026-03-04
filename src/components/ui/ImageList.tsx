"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

interface ImageItem {
  id: string;
  title: string;
  prompt: string;
  aspect_ratio: string;
  file_url: string;
  credits_used: number;
  created_at: string;
}

interface ImageListProps {
  onSelect: (image: ImageItem) => void;
  selectedId: string | null;
  refreshKey: number;
  onListLoaded?: (list: ImageItem[]) => void;
}

export function ImageList({ onSelect, selectedId, refreshKey, onListLoaded }: ImageListProps) {
  const { t } = useLanguage();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch("/api/images");
      if (!res.ok) return;
      const data = await res.json();
      const list = data.images || [];
      setImages(list);
      onListLoaded?.(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [onListLoaded]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages, refreshKey]);

  const handleDelete = async (id: string) => {
    if (!confirm(t("image.list.delete_confirm"))) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setImages((prev) => prev.filter((m) => m.id !== id));
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200/60 dark:border-zinc-800">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 dark:text-indigo-400 shrink-0">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {t("image.list.title")}
        </h2>
        <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400">
          {images.length}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-zinc-600 dark:border-t-white" />
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-zinc-600 mb-3">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">
              {t("image.list.empty")}
            </p>
            <p className="text-[10px] text-gray-300 dark:text-zinc-600 mt-1">
              {t("image.list.empty_desc")}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {images.map((image) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelect(image)}
                className={`group relative flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-100/60 dark:border-zinc-800/60 transition-all ${
                  selectedId === image.id
                    ? "bg-indigo-50/70 dark:bg-indigo-950/20"
                    : "hover:bg-gray-50/70 dark:hover:bg-zinc-900/40"
                }`}
              >
                {/* Selected indicator */}
                {selectedId === image.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500 dark:bg-indigo-400" />
                )}

                {/* Thumbnail */}
                <div className={`shrink-0 w-10 h-10 rounded-lg mt-0.5 overflow-hidden transition-colors ${
                  selectedId === image.id
                    ? "ring-2 ring-indigo-500/50 dark:ring-indigo-400/50"
                    : ""
                }`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.file_url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${
                    selectedId === image.id
                      ? "text-indigo-700 dark:text-indigo-300"
                      : "text-gray-800 dark:text-zinc-200"
                  }`}>
                    {image.title || image.prompt.slice(0, 40)}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5 truncate">
                    {image.prompt.slice(0, 50)}{image.prompt.length > 50 ? "..." : ""}
                  </p>
                  <p className="text-[10px] text-gray-300 dark:text-zinc-600 mt-0.5">
                    {formatDate(image.created_at)}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(image.id);
                  }}
                  disabled={deletingId === image.id}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  {deletingId === image.id ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border border-red-300 border-t-red-600" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 dark:text-red-500">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
