"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/lib/language-context";
import { DataTable, type Column } from "@/components/admin/DataTable";

interface ContentItem {
  id: string;
  user_id: string;
  user_email: string;
  title: string;
  service: string;
  credits_used: number;
  created_at: string;
}

const SERVICES = [
  { value: "", ko: "전체", en: "All" },
  { value: "images", ko: "이미지", en: "Images" },
  { value: "videos", ko: "영상", en: "Videos" },
  { value: "musics", ko: "음악", en: "Music" },
  { value: "documents", ko: "문서", en: "Documents" },
  { value: "codes", ko: "코드", en: "Code" },
  { value: "fortunes", ko: "사주", en: "Fortune" },
  { value: "calories", ko: "칼로리", en: "Calorie" },
  { value: "math_solutions", ko: "수학", en: "Math" },
  { value: "writings", ko: "글쓰기", en: "Writing" },
];

const SERVICE_COLORS: Record<string, string> = {
  images: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400",
  videos: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  musics: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  documents: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  codes: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  fortunes: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
  calories: "bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400",
  math_solutions: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400",
  writings: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
};

export default function AdminContentPage() {
  const { t, lang } = useLanguage();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [serviceFilter, setServiceFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (serviceFilter) params.set("service", serviceFilter);
    params.set("page", String(page));
    params.set("limit", "20");

    const res = await fetch(`/api/admin/content?${params}`);
    const data = await res.json();
    setContent(data.content || []);
    setTotalCount(data.totalCount || 0);
    setLoading(false);
  }, [serviceFilter, page]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleDelete = async (item: ContentItem) => {
    if (!confirm(t("admin.content.delete_confirm"))) return;
    setDeleting(item.id);
    await fetch("/api/admin/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service: item.service, id: item.id }),
    });
    setDeleting(null);
    fetchContent();
  };

  const columns: Column<ContentItem>[] = [
    {
      key: "service",
      label: t("admin.content.service"),
      render: (row) => {
        const label = SERVICES.find((s) => s.value === row.service);
        return (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SERVICE_COLORS[row.service] || ""}`}>
            {label ? label[lang] : row.service}
          </span>
        );
      },
    },
    {
      key: "user_email",
      label: t("admin.content.user"),
      render: (row) => (
        <span className="truncate max-w-[180px] block text-sm">{row.user_email}</span>
      ),
    },
    {
      key: "title",
      label: t("admin.content.item_title"),
      render: (row) => (
        <span className="truncate max-w-[200px] block">{row.title || "Untitled"}</span>
      ),
    },
    {
      key: "credits_used",
      label: t("admin.content.credits_used"),
      render: (row) => <span className="font-mono">{row.credits_used}</span>,
    },
    {
      key: "created_at",
      label: t("admin.content.created"),
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(row);
          }}
          disabled={deleting === row.id}
          className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-50"
        >
          {deleting === row.id ? "..." : t("admin.content.delete")}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t("admin.content.title")}
      </h1>

      {/* Service tabs */}
      <div className="flex flex-wrap gap-2">
        {SERVICES.map((svc) => (
          <button
            key={svc.value}
            onClick={() => {
              setServiceFilter(svc.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              serviceFilter === svc.value
                ? "bg-gray-900 dark:bg-white text-white dark:text-zinc-900"
                : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700"
            }`}
          >
            {svc[lang]}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
        <DataTable
          columns={columns}
          data={content}
          totalCount={totalCount}
          page={page}
          limit={20}
          onPageChange={setPage}
          loading={loading}
        />
      </div>
    </div>
  );
}
