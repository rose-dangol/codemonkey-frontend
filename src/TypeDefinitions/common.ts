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
