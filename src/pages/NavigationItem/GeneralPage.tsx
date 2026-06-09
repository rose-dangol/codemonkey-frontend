import type { ColumnDef } from "@tanstack/react-table";

import {  useQuery, useQueryClient } from "@tanstack/react-query";
import "@/App.css";
import { SquarePen } from "lucide-react";
import GeneralPageTemplate from "@/payments/generalPageTemplate";
import { GeneralPageService } from "@/services/GeneralPage/GeneralPage";
import { Link } from "react-router-dom";
import type { GeneralPageDto } from "@/TypeDefinitions/GeneralPage";

const GeneralPage = () => {


  const queryClient = useQueryClient();

  const { data: pageData } = useQuery({
    queryKey: ["pageData"],
    queryFn: () => GeneralPageService.getAll(),
  });

  //   const handleUpdate = (updatedData: Partial<UpdateProductDto>) => {
  //     if (!selectedProduct) return;
  //     mutation.mutate({
  //       ...updatedData,
  //       id: selectedProduct.id,
  //     } as UpdateProductDto);
  //   };

  const handleDelete = async (id: string[]) => {
    console.log("selectedId:", id);
    await GeneralPageService.delete(id);
    queryClient.invalidateQueries({ queryKey: ["pageData"] });
  };

  const GeneralPageColumns: ColumnDef<GeneralPageDto>[] = [
    {
      accessorKey: "heading",
      header: "Heading",
    },
    {
      accessorKey: "slug",
      header: "Slug",
    },

    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <Link
          to={`/generalPage/update/${row.original.id}`}
          className="flex justify-center items-center rounded-lg p-2 w-max cursor-pointer transition-all hover:bg-gray-100 hover:scale-110 action-hover"
        >
          <SquarePen size={20} />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <h1 className="heading-font">Tags</h1>

      <GeneralPageTemplate
        data={pageData}
        columns={GeneralPageColumns}
        link="/generalPage/create"
        onDelete={handleDelete}
        title={"General Page"}
      />
    </div>
  );
};

export default GeneralPage;
