import type { ColumnDef } from "@tanstack/react-table";
import { columns as defaultColumns } from "./columns";
import { DataTable } from "./data-table";
import { Link, useNavigate } from "react-router-dom";

type GeneralPageProps = {
  data: any[];
  columns?: ColumnDef<any, any>[];
  link?: string;
  title: string;
  onDelete?: (id: string[]) => void;
};

export default function GeneralPageTemplate({
  data,
  columns,
  link,
  onDelete,
  title = "Value",
}: GeneralPageProps) {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto py-10">
      <button
        onClick={() => navigate(link ?? "")}
        className="action state-color-text p-2 rounded-md border-2 border-state-color "
      >
        <p className="text-sm px-2">Add {title} </p>
      </button>
      <DataTable
        id={data?.map((item) => item?.id)}
        fields={columns ?? defaultColumns}
        data={data ?? []}
        onDelete={onDelete}
      />
    </div>
  );
}
