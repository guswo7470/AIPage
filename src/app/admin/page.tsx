"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { StatCard } from "@/components/admin/StatCard";
import { SimpleBarChart } from "@/components/admin/SimpleBarChart";
import { SimpleLineChart } from "@/components/admin/SimpleLineChart";
import { SimplePieChart } from "@/components/admin/SimplePieChart";

interface Stats {
  totalUsers: number;
  newUsersWeek: number;
  newUsersMonth: number;
  activeSubscriptions: number;
  planDistribution: { free: number; pro: number; ultra: number };
  totalRevenue: number;
  monthRevenue: number;
  revenueByDay: Record<string, number>;
  usersByDay: Record<string, number>;
  serviceUsage: { service: string; count: number }[];
  totalGenerations: number;
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

export default function AdminDashboard() {
  const { t, lang } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
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

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {t("admin.common.error")}
      </div>
    );
  }

  // Prepare chart data
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 29 + i);
    return d.toISOString().slice(0, 10);
  });

  const revenueChartData = last30Days.map((day) => ({
    label: day,
    value: (stats.revenueByDay[day] || 0) / 100,
  }));

  const userGrowthData = last30Days.map((day) => ({
    label: day,
    value: stats.usersByDay[day] || 0,
  }));

  const planChartData = [
    { label: "Free", value: stats.planDistribution.free, color: "#94a3b8" },
    { label: "Pro", value: stats.planDistribution.pro, color: "#3b82f6" },
    { label: "Ultra", value: stats.planDistribution.ultra, color: "#8b5cf6" },
  ];

  const serviceChartData = stats.serviceUsage
    .sort((a, b) => b.count - a.count)
    .map((s) => ({
      label: SERVICE_LABELS[s.service]?.[lang] || s.service,
      value: s.count,
    }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t("admin.title")}
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t("admin.stat.total_users")}
          value={stats.totalUsers.toLocaleString()}
          color="blue"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          }
        />
        <StatCard
          label={t("admin.stat.new_this_week")}
          value={`+${stats.newUsersWeek}`}
          color="green"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          }
        />
        <StatCard
          label={t("admin.stat.revenue_month")}
          value={`$${(stats.monthRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          color="violet"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          }
        />
        <StatCard
          label={t("admin.stat.total_generations")}
          value={stats.totalGenerations.toLocaleString()}
          color="amber"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-4">
            {t("admin.chart.revenue_trend")}
          </h3>
          <SimpleBarChart
            data={revenueChartData}
            color="#8b5cf6"
            formatValue={(v) => `$${v.toFixed(0)}`}
            yLabel={lang === "ko" ? "매출 ($)" : "Revenue ($)"}
          />
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-4">
            {t("admin.chart.user_growth")}
          </h3>
          <SimpleLineChart
            data={userGrowthData}
            yLabel={lang === "ko" ? "신규 가입자 (명)" : "New Users"}
          />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-4">
            {t("admin.chart.plan_distribution")}
          </h3>
          <SimplePieChart data={planChartData} />
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-4">
            {t("admin.chart.service_popularity")}
          </h3>
          <SimpleBarChart data={serviceChartData} color="#3b82f6" height={160} />
        </div>
      </div>
    </div>
  );
}
