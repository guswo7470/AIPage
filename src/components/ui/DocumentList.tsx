"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

interface DocumentItem {
  id: string;
  title: string;
  prompt: string;
  document_type: string;
  file_url: string | null;
  credits_used: number;
  created_at: string;
}

interface DocumentListProps {
  onSelect: (document: DocumentItem) => void;
  selectedId: string | null;
  refreshKey: number;
  onListLoaded?: (list: DocumentItem[]) => void;
}

const TYPE_LABELS: Record<string, string> = {
  pdf: "PDF",
  excel: "XLS",
  ppt: "PPT",
  word: "DOC",
};

export function DocumentList({ onSelect, selectedId, refreshKey, onListLoaded }: DocumentListProps) {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) return;
      const data = await res.json();
      const list = data.documents || [];
      setDocuments(list);
      onListLoaded?.(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [onListLoaded]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, refreshKey]);

  const handleDelete = async (id: string) => {
    if (!confirm(t("document.list.delete_confirm"))) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500 dark:text-cyan-400 shrink-0">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {t("document.list.title")}
        </h2>
        <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400">
          {documents.length}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-zinc-600 dark:border-t-white" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-zinc-600 mb-3">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">
              {t("document.list.empty")}
            </p>
            <p className="text-[10px] text-gray-300 dark:text-zinc-600 mt-1">
              {t("document.list.empty_desc")}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelect(doc)}
                className={`group relative flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-100/60 dark:border-zinc-800/60 transition-all ${
                  selectedId === doc.id
                    ? "bg-cyan-50/70 dark:bg-cyan-950/20"
                    : "hover:bg-gray-50/70 dark:hover:bg-zinc-900/40"
                }`}
              >
                {/* Selected indicator */}
                {selectedId === doc.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-500 dark:bg-cyan-400" />
                )}

                {/* Icon */}
                <div className={`shrink-0 w-10 h-10 rounded-lg mt-0.5 flex items-center justify-center transition-colors ${
                  selectedId === doc.id
                    ? "bg-cyan-100 dark:bg-cyan-900/40 ring-2 ring-cyan-500/50 dark:ring-cyan-400/50"
                    : "bg-gray-100 dark:bg-zinc-800"
                }`}>
                  <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                    {TYPE_LABELS[doc.document_type] || "DOC"}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${
                    selectedId === doc.id
                      ? "text-cyan-700 dark:text-cyan-300"
                      : "text-gray-800 dark:text-zinc-200"
                  }`}>
                    {doc.title}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5 truncate">
                    {doc.prompt.slice(0, 50)}
                  </p>
                  <p className="text-[10px] text-gray-300 dark:text-zinc-600 mt-0.5">
                    {formatDate(doc.created_at)}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doc.id);
                  }}
                  disabled={deletingId === doc.id}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  {deletingId === doc.id ? (
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
