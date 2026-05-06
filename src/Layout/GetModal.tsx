import api from "@/api/ApiUrl";
import noImg from "../assets/images/Nike.jpg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GetModalProps } from "@/TypeDefinitions/ModalType";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function GetModal<T>({
  open,
  onOpenChange,
  id,
  endpoint,
  title = "Details",
}: GetModalProps<T>) {
  const { data: ModalData } = useQuery({
    queryKey: [title, id],
    queryFn: () => fetchData(),
    enabled: open,
  });

  const fetchData = async () => {
    const res = await api.get(endpoint);
    return res.data;
  };

  // State (add to your component)
  const [search, setSearch] = useState("");
  const items = ModalData?.products;
  const filtered = items?.filter((item: any) =>
    item.productName?.toLowerCase().includes(search?.toLowerCase()),
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-primary border-0 rounded-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="px-4 pt-4 pb-2 ">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm action hover:bg-secondary focus:bg-white border border-transparent focus:border-gray-300 rounded-lg outline-none transition-all duration-150 placeholder:text-gray-400 text-gray-800"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="px-4 pb-4 space-y-1 overflow-y-auto max-h-[420px] thin-scrollbar">
          {filtered?.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">
              No items found
            </p>
          ) : (
            filtered?.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-secondary transition-colors duration-100 group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-secondary">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    onError={(e) => {
                      e.currentTarget.src = noImg;
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="description-text truncate leading-tight">
                    {item.productName}
                  </p>
                  <p className="sub-text mt-0.5 truncate">
                    Qty: {item.quantity}
                  </p>
                </div>

                {/* <svg
                  className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg> */}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
