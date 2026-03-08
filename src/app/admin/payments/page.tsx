"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/lib/language-context";
import { StatCard } from "@/components/admin/StatCard";
import { DataTable, type Column } from "@/components/admin/DataTable";

interface Payment {
  id: string;
  user_id: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  users: { email: string; name: string };
}

const STATUS_COLORS: Record<string, string> = {
  succeeded: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  failed: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

export default function AdminPaymentsPage() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState({ totalRevenue: 0, monthRevenue: 0, successCount: 0, failedCount: 0 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (planFilter) params.set("plan", planFilter);
    if (searchQuery) params.set("search", searchQuery);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    params.set("page", String(page));
    params.set("limit", "20");

    const res = await fetch(`/api/admin/payments?${params}`);
    const data = await res.json();
    setPayments(data.payments || []);
    setTotalCount(data.totalCount || 0);
    setSummary(data.summary || { totalRevenue: 0, monthRevenue: 0, successCount: 0, failedCount: 0 });
    setLoading(false);
  }, [statusFilter, planFilter, searchQuery, fromDate, toDate, page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const columns: Column<Payment>[] = [
    {
      key: "created_at",
      label: t("admin.payments.date"),
      render: (row) => {
        const d = new Date(row.created_at);
        return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
      },
    },
    {
      key: "users",
      label: t("admin.payments.user"),
      render: (row) => (
        <span className="truncate max-w-[200px] block">
          {row.users?.email || row.user_id}
        </span>
      ),
    },
    {
      key: "plan",
      label: t("admin.payments.plan"),
      render: (row) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
          {row.plan}
        </span>
      ),
    },
    {
      key: "amount",
      label: t("admin.payments.amount"),
      render: (row) => (
        <span className="font-mono font-semibold">
          ${(row.amount / 100).toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      label: t("admin.payments.status"),
      render: (row) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[row.status] || ""}`}>
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t("admin.payments.title")}
      </h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t("admin.payments.total_revenue")}
          value={`$${(summary.totalRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          color="violet"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
          }
        />
        <StatCard
          label={t("admin.payments.month_revenue")}
          value={`$${(summary.monthRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          color="blue"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          }
        />
        <StatCard
          label={t("admin.payments.success_count")}
          value={summary.successCount}
          color="green"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
          }
        />
        <StatCard
          label={t("admin.payments.failed_count")}
          value={summary.failedCount}
          color="amber"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          }
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => { e.preventDefault(); setSearchQuery(searchInput); setPage(1); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("admin.payments.search_user")}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-zinc-500 w-44"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t("admin.users.search")}
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white outline-none"
        >
          <option value="">{t("admin.users.all_status")}</option>
          <option value="succeeded">Succeeded</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white outline-none"
        >
          <option value="">{t("admin.users.all_plans")}</option>
          <option value="pro">Pro</option>
          <option value="ultra">Ultra</option>
          <option value="credits">Credits</option>
        </select>
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
            className="px-2 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white outline-none"
          />
          <span className="text-gray-400 dark:text-zinc-500 text-sm">~</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setPage(1); }}
            className="px-2 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white outline-none"
          />
        </div>
        {(searchQuery || statusFilter || planFilter || fromDate || toDate) && (
          <button
            onClick={() => {
              setSearchInput(""); setSearchQuery("");
              setStatusFilter(""); setPlanFilter("");
              setFromDate(""); setToDate("");
              setPage(1);
            }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            {t("admin.common.reset")}
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
        <DataTable
          columns={columns}
          data={payments}
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
