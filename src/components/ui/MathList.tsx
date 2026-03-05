"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

interface MathItem {
  id: string;
  title: string;
  input_type: string;
  image_url: string | null;
  credits_used: number;
  created_at: string;
}

interface MathListProps {
  onSelect: (item: MathItem) => void;
  selectedId: string | null;
  refreshKey: number;
  onListLoaded?: (list: MathItem[]) => void;
}

export function MathList({ onSelect, selectedId, refreshKey, onListLoaded }: MathListProps) {
  const { t } = useLanguage();
  const [items, setItems] = useState<MathItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/math-solutions");
      if (!res.ok) return;
      const data = await res.json();
      const list = data.mathSolutions || [];
      setItems(list);
      onListLoaded?.(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [onListLoaded]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems, refreshKey]);

  const handleDelete = async (id: string) => {
    if (!confirm(t("math.list.delete_confirm"))) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/math-solutions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((c) => c.id !== id));
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 dark:text-red-400 shrink-0">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="8" y1="10" x2="16" y2="10" />
          <line x1="8" y1="14" x2="12" y2="14" />
        </svg>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {t("math.list.title")}
        </h2>
        <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400">
          {items.length}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-zinc-600 dark:border-t-white" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-zinc-600 mb-3">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="10" x2="16" y2="10" />
            </svg>
            <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">
              {t("math.list.empty")}
            </p>
            <p className="text-[10px] text-gray-300 dark:text-zinc-600 mt-1">
              {t("math.list.empty_desc")}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelect(item)}
                className={`group relative flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-100/60 dark:border-zinc-800/60 transition-all ${
                  selectedId === item.id
                    ? "bg-red-50/70 dark:bg-red-950/20"
                    : "hover:bg-gray-50/70 dark:hover:bg-zinc-900/40"
                }`}
              >
                {selectedId === item.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500 dark:bg-red-400" />
                )}

                {/* Thumbnail or icon */}
                <div className={`shrink-0 w-10 h-10 rounded-lg mt-0.5 overflow-hidden flex items-center justify-center ${
                  selectedId === item.id ? "ring-2 ring-red-500/50 dark:ring-red-400/50" : ""
                } ${item.input_type === "image" && item.image_url ? "bg-gray-100 dark:bg-zinc-800" : "bg-red-50 dark:bg-red-900/20"}`}>
                  {item.input_type === "image" && item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 dark:text-red-400">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${
                    selectedId === item.id
                      ? "text-red-700 dark:text-red-300"
                      : "text-gray-800 dark:text-zinc-200"
                  }`}>
                    {item.title}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5 truncate">
                    {item.input_type === "image" ? "📷" : "✏️"} {item.input_type === "image" ? t("math.tab.image") : t("math.tab.text")}
                  </p>
                  <p className="text-[10px] text-gray-300 dark:text-zinc-600 mt-0.5">
                    {formatDate(item.created_at)}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  disabled={deletingId === item.id}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  {deletingId === item.id ? (
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
