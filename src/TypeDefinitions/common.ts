export type Granularity = "day" | "month" | "year";

export interface DateRangeQueryParams {
  startDate: string; // ISO string
  endDate: string; // ISO string
  granularity: Granularity;
}

export interface DateRangeData<TData = unknown> {
  data: TData | undefined;
  startDate: string;
  endDate: string;
  revenueGranularity: Granularity;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const statusColorMap: Record<string, string> = {
  AVAILABLE: "text-green-400",
  DAMAGED: "text-red-400",
  RESERVED: "text-blue-400",
  MISPLACED: "text-orange-400",
};
