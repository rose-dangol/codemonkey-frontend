import type { ColumnDef } from "@tanstack/react-table";

export type DataTableProps<TData> = {
  data: TData[];
  id: string[];
  fields: ColumnDef<TData, unknown>[];
  /** Column IDs/accessorKeys that should appear in the filter dropdown. If omitted, all columns are filterable. */
  filterableColumns?: string[];
  /** Enable row selection checkboxes. Defaults to false. */
  enableRowSelection?: boolean;
  /** Enable column visibility toggling. Defaults to true. */
  enableColumnVisibility?: boolean;
  /** Custom placeholder for the search input */
  searchPlaceholder?: string;
  onUpdate?: (row: TData) => void;
  onDelete?: (id: string[]) => void;
};
