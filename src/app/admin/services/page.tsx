"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { SimpleBarChart } from "@/components/admin/SimpleBarChart";

interface ServiceStats {
  service: string;
  totalCount: number;
  totalCredits: number;
  topUsers: { userId: string; email: string; count: number; credits: number }[];
}

const SERVICE_LABELS: Record<string, { ko: string; en: string }> = {
  images: { ko: "이미지", en: "Image" },
  videos: { ko: "영상", en: "Video" },
  musics: { ko: "음악", en: "Music" },
  documents: { ko: "문서", en: "Document" },
  codes: { ko: "코드", en: "Code" },
  fortunes: { ko: "사주", en: "Fortune" },
  calories: { ko: "칼로리", en: "Calorie" },
  math_solutions: { ko: "수학", en: "Math" },
  writings: { ko: "글쓰기", en: "Writing" },
};

export default function AdminServicesPage() {
  const { t, lang } = useLanguage();
  const [services, setServices] = useState<ServiceStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/services")
      .then((r) => r.json())
      .then((data) => setServices(data.services || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-zinc-500">
        {t("admin.common.loading")}
      </div>
    );
  }

  const chartData = services
    .sort((a, b) => b.totalCount - a.totalCount)
    .map((s) => ({
      label: SERVICE_LABELS[s.service]?.[lang] || s.service,
      value: s.totalCount,
    }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t("admin.services.title")}
      </h1>

      {/* Popularity chart */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-4">
          {t("admin.chart.service_popularity")}
        </h3>
        <SimpleBarChart data={chartData} color="#3b82f6" height={180} />
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services
          .sort((a, b) => b.totalCount - a.totalCount)
          .map((svc) => (
            <div
              key={svc.service}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5"
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                {SERVICE_LABELS[svc.service]?.[lang] || svc.service}
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-zinc-500">
                    {t("admin.services.total_generations")}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {svc.totalCount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-zinc-500">
                    {t("admin.services.total_credits")}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {svc.totalCredits.toLocaleString()}
                  </p>
                </div>
              </div>

              {svc.topUsers.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-zinc-500 mb-2">
                    {t("admin.services.top_users")}
                  </p>
                  <div className="space-y-1.5">
                    {svc.topUsers.map((u, i) => (
                      <div key={u.userId} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-zinc-400 truncate max-w-[180px]">
                          {i + 1}. {u.email}
                        </span>
                        <span className="font-mono text-gray-500 dark:text-zinc-500 shrink-0 ml-2">
                          {u.count} / {u.credits} cr
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
