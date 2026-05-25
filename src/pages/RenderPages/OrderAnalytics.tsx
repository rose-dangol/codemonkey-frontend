import type { ColumnDef } from "@tanstack/react-table";
import DemoPage from "@/payments/page";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import "@/App.css";
import { Eye, SquarePen } from "lucide-react";

import { OrderService } from "@/services/OrderManagement/OrderService";
import type { OrderType } from "@/TypeDefinitions/Order";
import { CustomerService } from "@/services/Customer/CustomerService";
import { Link } from "react-router-dom";

const OrderAnalytics = () => {
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);

  const queryClient = useQueryClient();

  const { data: orderData } = useQuery({
    queryKey: ["orders"],
    queryFn: () => OrderService.getAll(),
  });

  const { data: customerData } = useQuery({
    queryKey: ["customers"],
    queryFn: () => CustomerService.getAll(),
  });

  const customerMap = useMemo(() => {
    const map = new Map();
    customerData?.forEach((c: any) => {
      map.set(c.id, c.firstName);
    });
    return map;
  }, [customerData]);

  // const { data: brands } = useQuery({
  //   queryKey: ["brands"],
  //   queryFn: () => BrandService.getAll(),
  // });

  // const { data: productCategory } = useQuery({
  //   queryKey: ["product-category"],
  //   queryFn: () => CategoryService.getAll(),
  // });

  // const mutation = useMutation({
  //   mutationFn: (data: UpdateProductDto) =>
  //     ProductService.update(data.id ?? "", data),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["products"] });
  //     // toast.success("Category updated successfully");
  //   },
  // });

  // const addMutation = useMutation({
  //   mutationFn: (data: UpdateProductDto) =>
  //     ProductService.create({
  //       ...data,
  //     }),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["products"] });
  //     // toast.success("Category updated successfully");
  //   },
  // });

  // const handleUpdate = (updatedData: Partial<UpdateProductDto>) => {
  //   if (!selectedProduct) return;
  //   mutation.mutate({
  //     ...updatedData,
  //     id: selectedProduct.id,
  //   } as UpdateProductDto);
  // };

  const handleDelete = async (id: string[]) => {
    await OrderService.delete(id);
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  // const handleAdd = (data: Partial<UpdateProductDto>) => {
  //   addMutation.mutate(data as UpdateProductDto);
  // };
  const orderColumns: ColumnDef<OrderType>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order#",
    },
    {
      accessorKey: "customerId",
      header: "Customer",
      cell: ({ row }) => customerMap.get(row.original.customerId) || "—",
    },

    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => {
        return row.original.items?.length ?? 0;
      },
    },

    {
      accessorKey: "subtotal",
      header: "Total Amount",
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment Status",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "createdAt",
      header: "Order Time",
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        if (!createdAt) return "—";

        const date = new Date(createdAt);

        return date.toLocaleString([], {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      },
    },

    // {
    //   accessorKey: "productCategory",
    //   header: "Category",
    //   cell: ({ row }) => {
    //     return row.original.productCategory?.categoryName || "—";
    //   },
    // },

    // {
    //   accessorKey: "brand",
    //   header: "Brand",
    //   cell: ({ row }) => {
    //     return row.original.brand?.brandName || "—";
    //   },
    // },

    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const order = row.original;

        return (
          <div className="flex items-center gap-2">
            {/* Edit */}
            <div
              className="flex justify-center items-center rounded-lg p-2 w-max cursor-pointer transition-all hover:bg-gray-100 hover:scale-110 action-hover"
              onClick={() => {
                // setSelectedProduct(order);
                setOpen(true);
              }}
            >
              <SquarePen size={20} />
            </div>

            {/* View */}
            <Link
              to={`/order/detail/${order.id}`}
              className="flex justify-center items-center rounded-lg p-2 w-max cursor-pointer transition-all hover:bg-gray-100 hover:scale-110 action-hover"
            >
              <Eye size={20} />
            </Link>
          </div>
        );
      },
    },
  ];

  //   useEffect(() => {
  //     products && setProductData(products);
  //   }, [products]);

  return (
    <div>
      <h1 className="heading-font">Order Analytics</h1>

      <DemoPage
        data={orderData}
        columns={orderColumns}
        // onUpdate={handleUpdate}
        onDelete={handleDelete}
        openAdd={openAdd}
        setOpenAdd={setOpenAdd}
        title={"Product"}
      />
      {/* <UpdateModal<UpdateProductDto>
        open={open}
        setOpen={setOpen}
        title="Update Product"
        description="Update Product details"
        fields={updateProductFields(
          brands,
          productCategory,

          selectedProduct?.id,
        )}
        initialData={
          selectedProduct
            ? {
                ...selectedProduct,
                productCategoryId: selectedProduct.productCategory?.id || "",
                productBrandId: selectedProduct.brand?.id || "",
              }
            : {}
        }
        allItems={productCategory}
        onUpdate={(updatedData) => {
          handleUpdate(updatedData);
          setOpen(false);
        }}
      />
      <UpdateModal<UpdateProductDto>
        open={openAdd}
        setOpen={setOpenAdd}
        title="Add Product"
        description="Add new Product"
        fields={updateProductFields(brands, productCategory)}
        onUpdate={(updatedData) => {
          handleAdd(updatedData);
          setOpenAdd(false);
        }}
      /> */}
    </div>
  );
};

export default OrderAnalytics;
