"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  SlidersHorizontal,
  SquareCheck,
  SquarePen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DataTableProps } from "@/TypeDefinitions/DataTable";
import "@/App.css";

export function DataTable<TData extends { id: string }>({
  fields,
  data,
  filterableColumns,
  enableColumnVisibility = true,
  enableRowSelection = true,
  searchPlaceholder,
  onUpdate,
  onDelete,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Which column is currently selected for filtering
  const [activeFilterColumn, setActiveFilterColumn] = React.useState<
    string | null
  >(null);

  // Final columns including selection and serial number
  const finalColumns = React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    const cols: ColumnDef<TData, unknown>[] = [];

    // Checkbox column for selection
    if (enableRowSelection) {
      cols.push({
        id: "select",
        header: "",
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            aria-label="Select row"
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#056B6A]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    // S.No. column
    cols.push({
      id: "sno",
      header: "S.No.",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
    });

   
    return [...cols, ...fields, ];
  }, [fields, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: finalColumns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  // Build the list of filterable columns dynamically from the table columns
  const availableFilterColumns = React.useMemo(() => {
    const allColumns = table
      .getAllColumns()
      .filter((col) => col.getCanFilter());

    if (filterableColumns && filterableColumns.length > 0) {
      return allColumns.filter((col) => filterableColumns.includes(col.id));
    }

    return allColumns;
  }, [table, filterableColumns]);

  // Auto-select first filterable column if none selected
  React.useEffect(() => {
    if (!activeFilterColumn && availableFilterColumns.length > 0) {
      setActiveFilterColumn(availableFilterColumns[0].id);
    }
  }, [activeFilterColumn, availableFilterColumns]);

  // Get the header label for a column
  const getColumnLabel = (columnId: string): string => {
    const col = table.getColumn(columnId);
    if (!col) return columnId;

    const header = col.columnDef.header;
    if (typeof header === "string") return header;

    return columnId
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const activeFilterValue =
    activeFilterColumn && table.getColumn(activeFilterColumn)
      ? ((table.getColumn(activeFilterColumn)?.getFilterValue() as string) ??
        "")
      : globalFilter;

  const handleFilterChange = (value: string) => {
    if (activeFilterColumn && table.getColumn(activeFilterColumn)) {
      table.getColumn(activeFilterColumn)?.setFilterValue(value);
    } else {
      setGlobalFilter(value);
    }
  };

  const handleFilterColumnSwitch = (columnId: string) => {
    // Clear previous column filter
    if (activeFilterColumn && table.getColumn(activeFilterColumn)) {
      table.getColumn(activeFilterColumn)?.setFilterValue("");
    }
    setGlobalFilter("");
    setActiveFilterColumn(columnId);
  };

  return (
    <div>
      {/* Toolbar: Filter + Column Visibility */}
      <div className="flex items-center justify-between gap-3 py-5">
        <div className="flex items-center gap-2 flex-1">
          {/* Filter Column Selector */}
          {availableFilterColumns.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0 gap-1.5 border border-slate-200 bg-white text-slate-600 text-xs font-medium rounded-lg shadow-none hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-60"
                  >
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  {activeFilterColumn
                    ? getColumnLabel(activeFilterColumn)
                    : "Add filter"}
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="rounded-xl border border-slate-100 shadow-lg shadow-slate-100/80 p-1"
              >
                <DropdownMenuLabel className="text-xs text-slate-400 font-medium px-2 py-1.5">
                  Filter by column
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                {availableFilterColumns.map((col) => (
                  <DropdownMenuItem
                    key={col.id}
                    onClick={() => handleFilterColumnSwitch(col.id)}
                    className={`text-sm rounded-lg px-2 py-1.5 cursor-pointer ${
                      activeFilterColumn === col.id
                        ? "font-semibold bg-blue-50 text-blue-700"
                        : "text-slate-600"
                    }`}
                  >
                    {getColumnLabel(col.id)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Filter Input */}
          <div className="relative max-w-xs w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <Input
              placeholder={
                searchPlaceholder ??
                `Search${activeFilterColumn ? ` by ${getColumnLabel(activeFilterColumn).toLowerCase()}` : ""}…`
              }
              value={activeFilterValue}
              onChange={(event) => handleFilterChange(event.target.value)}
              className="pl-8 h-9 text-sm border border-slate-200 rounded-lg bg-white shadow-none placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all"
            />
          </div>

          {/* Select All Button */}
          {enableRowSelection && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                table.toggleAllPageRowsSelected(
                  !table.getIsAllPageRowsSelected(),
                )
              }
              className={`h-9 gap-1.5 border border-slate-200 text-xs font-medium rounded-lg transition-all ${
                table.getIsAllPageRowsSelected() ||
                table.getIsSomePageRowsSelected()
                  ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <SquareCheck
                className={`h-3.5 w-3.5 ${
                  table.getIsAllPageRowsSelected() ||
                  table.getIsSomePageRowsSelected()
                    ? "text-blue-600"
                    : "opacity-60"
                }`}
              />
              {table.getIsAllPageRowsSelected() ? "Deselect All" : "Select All"}
            </Button>
          )}
        </div>

        {/* Bulk Actions + Column Visibility */}
        <div className="flex items-center gap-2">
          {/* Bulk Action Dropdown */}
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 border border-slate-200 bg-white text-slate-600 text-xs font-medium rounded-lg shadow-none hover:bg-slate-50 hover:border-slate-300 transition-all animate-in fade-in zoom-in duration-200"
                >
                  <SquareCheck className="h-3.5 w-3.5 text-blue-500" />
                  Actions ({table.getFilteredSelectedRowModel().rows.length})
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-xl border border-slate-100 shadow-lg shadow-slate-100/80 p-1 min-w-[150px]"
              >
                <DropdownMenuLabel className="text-xs text-slate-400 font-medium px-2 py-1.5">
                  Bulk Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem className="text-sm rounded-lg px-2 py-1.5 cursor-pointer text-slate-600 hover:bg-slate-50">
                  Export Selected
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm rounded-lg px-2 py-1.5 cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600" onClick={() => { onDelete && onDelete(table.getFilteredSelectedRowModel().rows.map((row) => row.original.id)) }}>
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Column Visibility Toggle */}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 border border-slate-200 bg-white text-slate-600 text-xs font-medium rounded-lg shadow-none hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 opacity-60" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-xl border border-slate-100 shadow-lg shadow-slate-100/80 p-1"
              >
                <DropdownMenuLabel className="text-xs text-slate-400 font-medium px-2 py-1.5">
                  Toggle columns
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100 " />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="text-sm capitalize rounded-lg px-2 py-1.5 text-slate-600 cursor-pointer"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {getColumnLabel(column.id)}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm shadow-slate-100">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-slate-100 state-color hover:bg-slate-50/70"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-4 py-3 text-xs font-semibold text-white uppercase tracking-wide"
                    style={{ border: "none" }}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer select-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getIsSorted() === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5 text-blue-500" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ChevronDown className="h-3.5 w-3.5 text-blue-500" />
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-25" />
                        )}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`
                border-b border-slate-50 last:border-0
                transition-colors duration-100
                hover:bg-blue-50/40
                data-[state=selected]:bg-[#FFCB44]
                ${i % 2 === 0 ? "bg-white" : "bg-slate-50/3"}
              `}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-4 py-3.5 text-sm font-heading"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={fields.length} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-40"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                    <span className="text-sm font-medium">
                      No results found
                    </span>
                    <span className="text-xs opacity-70">
                      Try adjusting your filters
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination + Info */}
      <div className="flex items-center justify-between pt-4 pb-1">
        {/* Row count */}
        <p className="text-xs text-slate-400 font-medium">
          {table.getFilteredRowModel().rows.length} result
          {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span className="ml-1 text-blue-500">
              · {table.getFilteredSelectedRowModel().rows.length} selected
            </span>
          )}
        </p>

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            Page{" "}
            <span className="font-semibold text-slate-600">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-600">
              {table.getPageCount()}
            </span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 shadow-none"
          >
            <ChevronDown className="h-4 w-4 rotate-90" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 shadow-none"
          >
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </Button>
        </div>
      </div>
    </div>
  );
}
