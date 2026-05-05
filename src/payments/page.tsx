import type { ColumnDef } from "@tanstack/react-table";
import { columns as defaultColumns } from "./columns";
import { DataTable } from "./data-table";

type DemoPageProps = {
  data: any[];
  columns?: ColumnDef<any, any>[];
  onUpdate?: (row: any) => void;
  onDelete?: (id: string[]) => void;
  openAdd?: boolean;
  setOpenAdd?: (open: boolean) => void;
  title: string;
};

export default function DemoPage({
  data,
  columns,
  onUpdate,
  onDelete,
  openAdd,
  setOpenAdd,
  title = "Value",
}: DemoPageProps) {
  return (
    <div className="container mx-auto py-10">
      <button
        className="action state-color-text p-2 rounded-md border-2 border-state-color "
        onClick={() => setOpenAdd?.(true)}
      >
        <p className="text-sm px-2">Add {title} </p>
      </button>
      <DataTable
        id={data.map((item) => item.id)}
        fields={columns ?? defaultColumns}
        data={data ?? []}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
}
