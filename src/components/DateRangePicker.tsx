// ─── DateRangePicker.tsx ──────────────────────────────────────────────────────
//
//  Self-contained date range picker that:
//    1. Owns start/end date state internally
//    2. Auto-detects granularity (day / month / year) from the range
//    3. Runs a useQuery with a dynamic apiUrl + queryKey you pass in
//    4. Calls onData({ data, startDate, endDate, granularity, isLoading, isError })
//       every time the query result or dates change — so the parent can feed
//       charts directly without knowing anything about dates or granularity.
//
//  ── Minimal usage ────────────────────────────────────────────────────────────
//
//    <DateRangePicker
//      apiUrl="/api/revenue"          // base URL — gets ?startDate=&endDate=&granularity= appended
//      queryKey="revenue-chart"       // string or string[] — dates+granularity auto-appended
//      onData={({ data, granularity }) => setChartData(buildChart(data, granularity))}
//    />
//
//  ── Advanced usage (custom fetcher) ──────────────────────────────────────────
//
//    <DateRangePicker
//      queryKey={["orders", shopId]}
//      queryFn={({ startDate, endDate, granularity }) =>
//        orderService.getChart(startDate, endDate, granularity)
//      }
//      onData={({ data }) => setOrders(data)}
//    />
//
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Granularity = "day" | "month" | "year";

export interface DateRangeQueryParams {
  startDate: string; // ISO string
  endDate: string; // ISO string
  granularity: Granularity;
}

/** Everything the parent needs to render a chart — passed to onData */
export interface DateRangeData<TData = unknown> {
  data: TData | undefined;
  startDate: string;
  endDate: string;
  granularity: Granularity;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export interface DateRangePickerProps<TData = unknown> {
  // ── API config (pick ONE of apiUrl or queryFn) ────────────────────────────

  /**
   * Base API URL. The picker appends `?startDate=&endDate=&granularity=`
   * automatically and fetches with the native fetch API.
   * e.g. "/api/revenue"  →  GET /api/revenue?startDate=...&endDate=...&granularity=month
   */
  apiUrl?: string;

  /**
   * Custom fetcher — receives current dates + granularity, returns a Promise.
   * Use this when you need a service class, auth headers, POST body, etc.
   * Takes priority over apiUrl if both are provided.
   */
  queryFn?: (params: DateRangeQueryParams) => Promise<TData>;

  /**
   * React Query cache key. Can be a string or array.
   * The picker automatically appends [startDate, endDate, granularity]
   * so the query re-runs whenever any of those change.
   * e.g. "revenue-chart"  →  ["revenue-chart", startDate, endDate, granularity]
   *      ["orders", shopId] → ["orders", shopId, startDate, endDate, granularity]
   */
  queryKey: string | string[];

  // ── Data callback ─────────────────────────────────────────────────────────

  /**
   * Called on mount and every time dates, granularity, or query result changes.
   * Gives the parent chart-ready data — no date logic needed in the parent.
   */
  onData: (result: DateRangeData<TData>) => void;

  // ── Initial / seed dates ──────────────────────────────────────────────────

  /** Seed start date (ISO string). Defaults to Jan 1 of current year. */
  initialStart?: string;

  /** Seed end date (ISO string). Defaults to today. */
  initialEnd?: string;

  // ── Visual ────────────────────────────────────────────────────────────────
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toISOStart(v: string) {
  return new Date(v + "T00:00:00").toISOString();
}
function toISOEnd(v: string) {
  return new Date(v + "T23:59:59").toISOString();
}

function defaultStart() {
  const t = new Date();
  return new Date(t.getFullYear(), 0, 1).toISOString();
}
function defaultEnd() {
  return new Date().toISOString();
}

function detectGranularity(start: string, end: string): Granularity {
  const diff =
    (new Date(end).getTime() - new Date(start).getTime()) / 86_400_000;
  if (diff <= 31) return "day";
  if (diff <= 365) return "month";
  return "year";
}

function buildQueryKey(
  base: string | string[],
  startDate: string,
  endDate: string,
  granularity: Granularity,
): string[] {
  const baseArr = Array.isArray(base) ? base : [base];
  return [...baseArr, startDate, endDate, granularity];
}

async function defaultFetcher<TData>(
  apiUrl: string,
  params: DateRangeQueryParams,
): Promise<TData> {
  const url = new URL(apiUrl, window.location.origin);
  url.searchParams.set("startDate", params.startDate);
  url.searchParams.set("endDate", params.endDate);
  url.searchParams.set("granularity", params.granularity);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// ─── Granularity Badge ────────────────────────────────────────────────────────

const GRANULARITY_COLORS: Record<Granularity, string> = {
  day: "bg-teal-100 text-teal-700",
  month: "bg-amber-100 text-amber-700",
  year: "bg-violet-100 text-violet-700",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function DateRangePicker<TData = unknown>({
  apiUrl,
  queryFn,
  queryKey,
  onData,
  initialStart,
  initialEnd,
  className = "",
}: DateRangePickerProps<TData>) {
  const [startDate, setStartDate] = useState(initialStart ?? defaultStart());
  const [endDate, setEndDate] = useState(initialEnd ?? defaultEnd());

  const granularity = useMemo(
    () => detectGranularity(startDate, endDate),
    [startDate, endDate],
  );

  const params: DateRangeQueryParams = useMemo(
    () => ({ startDate, endDate, granularity }),
    [startDate, endDate, granularity],
  );

  // Build the full React Query cache key
  const fullQueryKey = useMemo(
    () => buildQueryKey(queryKey, startDate, endDate, granularity),
    [queryKey, startDate, endDate, granularity],
  );

  // Resolve the actual fetcher function (custom queryFn > apiUrl)
  const resolvedQueryFn = useCallback((): Promise<TData> => {
    if (queryFn) return queryFn(params);
    if (apiUrl) return defaultFetcher<TData>(apiUrl, params);
    throw new Error("[DateRangePicker] Provide either `apiUrl` or `queryFn`.");
  }, [queryFn, apiUrl, params]);

  const { data, isLoading, isError, error } = useQuery<TData, Error>({
    queryKey: fullQueryKey,
    queryFn: resolvedQueryFn,
    enabled: !!(apiUrl || queryFn),
  });

  // Fire onData every time anything meaningful changes
  useEffect(() => {
    onData({
      data,
      startDate,
      endDate,
      granularity,
      isLoading,
      isError,
      error: error ?? null,
    });
  }, [
    data,
    startDate,
    endDate,
    granularity,
    isLoading,
    isError,
    error,
    onData,
  ]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleStart = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) setStartDate(toISOStart(e.target.value));
  }, []);

  const handleEnd = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) setEndDate(toISOEnd(e.target.value));
  }, []);

  // ── UI ───────────────────────────────────────────────────────────────────────

  return (
    <div
      className={`
        bg-secondary border-theme
        inline-flex flex-col sm:flex-row items-center gap-3
        rounded-2xl sm:rounded-full
        px-4 py-2 shadow-sm
        text-sm description-text
        ${className}
      `}
    >
      {/* Calendar icon */}
      <div className="flex items-center gap-2 shrink-0">
        <svg
          className="w-4 h-4 sub-text"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="sub-text text-xs font-semibold uppercase tracking-wider">
          Range:
        </span>
      </div>

      {/* Date inputs */}
      <div className="flex items-center gap-1">
        <input
          type="date"
          value={startDate.slice(0, 10)}
          onChange={handleStart}
          className="bg-transparent border-0 outline-none focus:outline-none focus:ring-0 p-0 text-xs font-bold description-text cursor-pointer w-[105px]"
          style={{ colorScheme: "dark" }}
        />
        <span className="sub-text text-xs px-1">—</span>
        <input
          type="date"
          value={endDate.slice(0, 10)}
          onChange={handleEnd}
          className="bg-transparent border-0 outline-none focus:outline-none focus:ring-0 p-0 text-xs font-bold description-text cursor-pointer w-[105px]"
          style={{ colorScheme: "dark" }}
        />
      </div>

      {/* Granularity pill — auto-computed, read-only visual */}
      <span
        className={`
          shrink-0 inline-flex items-center
          px-2.5 py-0.5 rounded-full
          text-[10px] font-bold uppercase tracking-widest
          transition-colors duration-300
          ${GRANULARITY_COLORS[granularity]}
        `}
      >
        {granularity}
      </span>

      {/* Loading / error indicator */}
      {isLoading && (
        <span className="shrink-0 w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin opacity-50" />
      )}
      {isError && (
        <span
          className="shrink-0 text-red-500 text-xs font-bold"
          title={error?.message}
        >
          ⚠
        </span>
      )}
    </div>
  );
}

export default DateRangePicker;
