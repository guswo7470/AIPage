"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

interface MusicItem {
  id: string;
  title: string;
  prompt: string;
  lyrics: string | null;
  file_url: string;
  credits_used: number;
  created_at: string;
}

interface MusicListProps {
  onSelect: (music: MusicItem) => void;
  selectedId: string | null;
  refreshKey: number;
  onListLoaded?: (list: MusicItem[]) => void;
}

export function MusicList({ onSelect, selectedId, refreshKey, onListLoaded }: MusicListProps) {
  const { t } = useLanguage();
  const [musics, setMusics] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMusics = useCallback(async () => {
    try {
      const res = await fetch("/api/musics");
      if (!res.ok) return;
      const data = await res.json();
      const list = data.musics || [];
      setMusics(list);
      onListLoaded?.(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [onListLoaded]);

  useEffect(() => {
    fetchMusics();
  }, [fetchMusics, refreshKey]);

  const handleDelete = async (id: string) => {
    if (!confirm(t("music.list.delete_confirm"))) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/musics", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setMusics((prev) => prev.filter((m) => m.id !== id));
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500 dark:text-violet-400 shrink-0">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {t("music.list.title")}
        </h2>
        <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400">
          {musics.length}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-zinc-600 dark:border-t-white" />
          </div>
        ) : musics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-zinc-600 mb-3">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">
              {t("music.list.empty")}
            </p>
            <p className="text-[10px] text-gray-300 dark:text-zinc-600 mt-1">
              {t("music.list.empty_desc")}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {musics.map((music) => (
              <motion.div
                key={music.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelect(music)}
                className={`group relative flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-100/60 dark:border-zinc-800/60 transition-all ${
                  selectedId === music.id
                    ? "bg-violet-50/70 dark:bg-violet-950/20"
                    : "hover:bg-gray-50/70 dark:hover:bg-zinc-900/40"
                }`}
              >
                {/* Playing indicator */}
                {selectedId === music.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-violet-500 dark:bg-violet-400" />
                )}

                {/* Icon */}
                <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg mt-0.5 transition-colors ${
                  selectedId === music.id
                    ? "bg-violet-100 dark:bg-violet-900/40"
                    : "bg-gray-100 dark:bg-zinc-800"
                }`}>
                  {selectedId === music.id ? (
                    <div className="flex items-end gap-[2px] h-3">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-[3px] rounded-full bg-violet-500 dark:bg-violet-400"
                          animate={{ height: [4, 12, 4] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-zinc-500">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${
                    selectedId === music.id
                      ? "text-violet-700 dark:text-violet-300"
                      : "text-gray-800 dark:text-zinc-200"
                  }`}>
                    {music.title || music.prompt.slice(0, 40)}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5 truncate">
                    {music.prompt.slice(0, 50)}{music.prompt.length > 50 ? "..." : ""}
                  </p>
                  <p className="text-[10px] text-gray-300 dark:text-zinc-600 mt-0.5">
                    {formatDate(music.created_at)}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(music.id);
                  }}
                  disabled={deletingId === music.id}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  {deletingId === music.id ? (
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
