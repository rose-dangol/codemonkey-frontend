import type { ColumnDef } from "@tanstack/react-table";
import DemoPage from "@/payments/page";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "@/App.css";
import { UpdateModal } from "@/Layout/UpdateModal";
import { updateNavigationItemFields } from "@/TypeDefinitions/ModalType";
import { Edit2Icon, Loader2, SquarePen } from "lucide-react";

import type {
  NavigationItemType,
  UpdateNavigationItemDto,
} from "@/TypeDefinitions/NavigationItem";
import { NavigationItemService } from "@/services/GeneralPage/NavigationItem";
import { GeneralPageService } from "@/services/GeneralPage/GeneralPage";
import { Link } from "react-router-dom";

const NavigationItem = () => {
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedNavigationItem, setSelectedNavigationItem] =
    useState<NavigationItemType | null>(null);

  const queryClient = useQueryClient();

  const { data: navigationItems } = useQuery({
    queryKey: ["navigationItems"],
    queryFn: () => NavigationItemService.getAll(),
  });

  const { data: pageData } = useQuery({
    queryKey: ["generalPage"],
    queryFn: () => GeneralPageService.getAll(),
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateNavigationItemDto) =>
      NavigationItemService.update(data.id ?? "", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navigationItems"] });
      // toast.success("Category updated successfully");
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: UpdateNavigationItemDto) =>
      NavigationItemService.create({
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navigationItems"] });
      // toast.success("Category updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string[]) => NavigationItemService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navigationItems"] });
    },
  });

  const handleUpdate = (updatedData: Partial<UpdateNavigationItemDto>) => {
    if (!selectedNavigationItem) return;
    mutation.mutate({
      ...updatedData,
      id: selectedNavigationItem.id,
    } as UpdateNavigationItemDto);
  };

  const handleDelete = async (id: string[]) => {
    deleteMutation.mutate(id);
  };

  const handleAdd = (data: Partial<UpdateNavigationItemDto>) => {
    addMutation.mutate(data as UpdateNavigationItemDto);
  };

  const navigationItemColumns: ColumnDef<NavigationItemType>[] = [
    {
      accessorKey: "label",
      header: "Label",
      cell: ({ row }) => {
        const label = row.original.label;
        return label ? (
          <>{label}</>
        ) : (
          <div className="h-9 w-9 rounded-lg bg-[#18181b] flex items-center justify-center text-[#8A8A8A] text-xs">
            N/A
          </div>
        );
      },
    },
    {
      accessorKey: "page",
      header: "URL",
      cell: ({ row }) => {
        const slug = row.original.page?.slug;

        return slug ? `/generalpage/${slug}` : "—";
      },
    },

    {
      accessorKey: "sortOrder",
      header: "Sort Order",
    },

    {
      accessorKey: "isVisible",
      header: "Visible",
      cell: ({ row }) => {
        const isVisible = row.original.isVisible;

        return (
          <span
            className={`px-2 py-1 text-xs rounded-full font-medium ${
              isVisible
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isVisible ? "Yes" : "No"}
          </span>
        );
      },
    },

    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center items-center gap-2  w-max cursor-pointer transition-all">
          {/* Edit */}
          <div
            className=" rounded-lg p-2 hover:bg-gray-100 hover:scale-110 action-hover"
            onClick={() => {
              setSelectedNavigationItem(row.original);
              setOpen(true);
            }}
          >
            <SquarePen size={20} />
          </div>

          {/* View / Navigate */}
          <Link
            to={`/generalPage/update/${row.original.page?.id}`}
            className="rounded-lg p-2 hover:bg-gray-100 hover:scale-110 action-hover"
          >
            <Edit2Icon size={20} />
          </Link>
        </div>
      ),
    },
  ];

  // console.log("item", selectedNavigationItem);

  // useEffect(() => {
  //   products && setProductData(products);
  // }, [products]);

  const isLoading =
    mutation.isPending || addMutation.isPending || deleteMutation.isPending;

  return (
    <div>
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-lg">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      )}
      <div className="flex gap-4 items-center">
        <h1 className="heading-font">Products</h1>
      </div>

      <>
        <DemoPage
          data={navigationItems}
          columns={navigationItemColumns}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          openAdd={openAdd}
          setOpenAdd={setOpenAdd}
          title={"Navigation Item"}
        />

        <UpdateModal<UpdateNavigationItemDto>
          open={open}
          setOpen={setOpen}
          title="Update Navigation Item"
          description="Update Navigation Item details"
          fields={updateNavigationItemFields(
            pageData,
            selectedNavigationItem?.id,
          )}
          initialData={selectedNavigationItem || undefined}
          onUpdate={(updatedData: UpdateNavigationItemDto) => {
            handleUpdate(updatedData);
            setOpen(false);
          }}
        />
        <UpdateModal<UpdateNavigationItemDto>
          open={openAdd}
          setOpen={setOpenAdd}
          title="Add Navigation Item"
          description="Add new Navigation Item"
          fields={updateNavigationItemFields(pageData)}
          onUpdate={(updatedData) => {
            handleAdd(updatedData);
            setOpenAdd(false);
          }}
        />
      </>
    </div>
  );
};

export default NavigationItem;
