import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Pencil,
  ChevronDown,
  Trash2,
  ChevronRight,
  Package,
  CreditCard,
  Clock,
  Tag,
  Hash,
  Layers,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderService } from "@/services/OrderManagement/OrderService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderAttribute {
  id: string;
  value: string;
  attribute: { key: string; name: string };
}

interface OrderItemSnapshot {
  sku: string;
  productName: string;
  productImage: string;
  attributes: OrderAttribute[];
}

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  discount: string;
  subtotal: string;
  snapshot: OrderItemSnapshot;
  cogsSnapshot: { shipping: string };
  createdAt: string;
}

interface ShippingSnapshot {
  recipientName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  label: string;
}

interface StatusHistory {
  id: string;
  status: string;
  note: string;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: string;
  paymentStatus: string;
  subtotal: string;
  shippingFee: string;
  discountTotal: string;
  taxTotal: string;
  grandTotal: string;
  createdAt: string;
  updatedAt: string;
  notes: string | null;
  cancelReason: string | null;
  items: OrderItem[];
  shippingSnapshot: ShippingSnapshot;
  statusHistory: StatusHistory[];
  promotions: unknown[];
  payments: unknown[];
  shipment: unknown | null;
}

// ─── Maps: order status → service method ─────────────────────────────────────

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const PAYMENT_STATUSES = [
  "UNPAID",
  "AWAITING_VERIFICATION",
  "PAID",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
  "FAILED",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (amount: string, currency = "NPR") =>
  `${currency} ${Number(amount).toLocaleString()}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusClasses: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border border-blue-200",
  PROCESSING: "bg-violet-50 text-violet-700 border border-violet-200",
  SHIPPED: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border border-rose-200",
  REFUNDED: "bg-slate-50 text-slate-600 border border-slate-200",
  UNPAID: "bg-rose-50 text-rose-700 border border-rose-200",
  AWAITING_VERIFICATION:
    "bg-yellow-50 text-yellow-700 border border-yellow-200",
  PAID: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  PARTIALLY_REFUNDED: "bg-orange-50 text-orange-700 border border-orange-200",
  FAILED: "bg-red-100 text-red-700 border border-red-300",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatusBadgeProps {
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  active: boolean;
  onToggle: () => void;
  isPending?: boolean;
}

function StatusBadge({
  value,
  options,
  onSelect,
  active,
  onToggle,
  isPending,
}: StatusBadgeProps) {
  return (
    <div className="relative inline-block">
      <button
        onClick={onToggle}
        disabled={isPending}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide
          cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed
          ${statusClasses[value] ?? "bg-gray-100 text-gray-600 border border-gray-200"}
          ${active ? "ring-2 ring-offset-1 ring-violet-300" : ""}`}
      >
        {isPending ? (
          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {value.replace(/_/g, " ")}
            <ChevronDown
              size={11}
              className={`transition-transform ${active ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>

      {active && (
        <div className="card absolute z-50 top-full mt-1.5 left-0 py-1.5 min-w-[200px]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className={`w-full text-left px-4 py-2 text-xs font-medium hover-color flex items-center gap-2
                ${opt === value ? "action-text" : "description-text"}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${opt === value ? "action" : "bg-transparent"}`}
              />
              {opt.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`card ${className}`}>{children}</div>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="sub-text text-xs font-semibold uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span
        className={`text-sm ${bold ? "heading-font font-semibold" : "description-text"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm font-medium ${bold ? "heading-font font-bold" : "description-text"}`}
      >
        {value}
      </span>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="bg-primary min-h-screen px-6 py-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-7">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex flex-col gap-5" style={{ flex: "0 0 65%" }}>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="flex flex-col gap-4" style={{ flex: "0 0 35%" }}>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrderDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery<Order>({
    queryKey: ["order-detail", id],
    queryFn: () => OrderService.getById(id),
  });

  const [activeDropdown, setActiveDropdown] = useState<
    "order" | "payment" | null
  >(null);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [billingOpen, setBillingOpen] = useState(false);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["order-detail", id] });

  // ─── Order status mutations ──────────────────────────────────────────────

  const confirmMutation = useMutation({
    mutationFn: () => OrderService.confirm(id!),
    onSuccess: invalidate,
  });
  const processMutation = useMutation({
    mutationFn: () => OrderService.process(id!),
    onSuccess: invalidate,
  });
  const shipMutation = useMutation({
    mutationFn: () => OrderService.ship(id!),
    onSuccess: invalidate,
  });
  const deliverMutation = useMutation({
    mutationFn: () => OrderService.deliver(id!),
    onSuccess: invalidate,
  });
  const cancelMutation = useMutation({
    mutationFn: () => OrderService.cancel(id!),
    onSuccess: invalidate,
  });
  const refundMutation = useMutation({
    mutationFn: () => OrderService.refund(id!),
    onSuccess: invalidate,
  });

  // ─── Payment status mutations ────────────────────────────────────────────

  const awaitingMutation = useMutation({
    mutationFn: () => OrderService.markAwaitingVerification(id!),
    onSuccess: invalidate,
  });
  const failedMutation = useMutation({
    mutationFn: () => OrderService.markPaymentFailed(id!),
    onSuccess: invalidate,
  });
  const partialMutation = useMutation({
    mutationFn: () => OrderService.markPartiallyRefunded(id!),
    onSuccess: invalidate,
  });

  // ─── Dispatch ────────────────────────────────────────────────────────────

  const handleOrderStatus = (v: string) => {
    setActiveDropdown(null);
    const map: Record<string, () => void> = {
      CONFIRMED: () => confirmMutation.mutate(),
      PROCESSING: () => processMutation.mutate(),
      SHIPPED: () => shipMutation.mutate(),
      DELIVERED: () => deliverMutation.mutate(),
      CANCELLED: () => cancelMutation.mutate(),
      REFUNDED: () => refundMutation.mutate(),
    };
    map[v]?.();
  };

  const handlePaymentStatus = (v: string) => {
    setActiveDropdown(null);
    const map: Record<string, () => void> = {
      AWAITING_VERIFICATION: () => awaitingMutation.mutate(),
      FAILED: () => failedMutation.mutate(),
      PARTIALLY_REFUNDED: () => partialMutation.mutate(),
    };
    map[v]?.();
  };

  const orderMutationPending =
    confirmMutation.isPending ||
    processMutation.isPending ||
    shipMutation.isPending ||
    deliverMutation.isPending ||
    cancelMutation.isPending ||
    refundMutation.isPending;

  const paymentMutationPending =
    awaitingMutation.isPending ||
    failedMutation.isPending ||
    partialMutation.isPending;

  // ─── Render ──────────────────────────────────────────────────────────────

  if (isLoading) return <OrderDetailSkeleton />;
  if (isError || !order) {
    return (
      <div className="bg-primary min-h-screen flex items-center justify-center">
        <p className="description-text text-sm">Failed to load order.</p>
      </div>
    );
  }

  return (
    <div
      className="bg-primary min-h-screen px-6 py-8"
      onClick={() => setActiveDropdown(null)}
    >
      <div className="max-w-[1200px] mx-auto">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="sub-text text-xs">Orders</span>
              <ChevronRight size={12} className="sub-text" />
              <span className="description-text text-xs font-medium">
                {order.orderNumber}
              </span>
            </div>
            <h1 className="heading-font text-2xl font-bold tracking-tight">
              Order Detail
            </h1>
            <p className="sub-text text-sm mt-0.5">
              Placed {fmtDate(order.createdAt)}
            </p>
          </div>

          <div
            className="flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-end gap-1">
              <p className="sub-text text-[10px] font-medium uppercase tracking-wider">
                Order
              </p>
              <StatusBadge
                value={order.status}
                options={ORDER_STATUSES}
                active={activeDropdown === "order"}
                onToggle={() =>
                  setActiveDropdown(activeDropdown === "order" ? null : "order")
                }
                onSelect={handleOrderStatus}
                isPending={orderMutationPending}
              />
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="sub-text text-[10px] font-medium uppercase tracking-wider">
                Payment
              </p>
              <StatusBadge
                value={order.paymentStatus}
                options={PAYMENT_STATUSES}
                active={activeDropdown === "payment"}
                onToggle={() =>
                  setActiveDropdown(
                    activeDropdown === "payment" ? null : "payment",
                  )
                }
                onSelect={handlePaymentStatus}
                isPending={paymentMutationPending}
              />
            </div>
          </div>
        </div>

        {/* ── Two column grid ── */}
        <div className="flex gap-6 items-start">
          {/* ═══ LEFT (65%) ═══ */}
          <div className="flex flex-col gap-5" style={{ flex: "0 0 65%" }}>
            <Card className="p-5">
              <SectionLabel>Items in this order</SectionLabel>
              <div className="flex flex-col gap-6">
                {order.items.map((orderItem, idx) => {
                  const itemColor = orderItem.snapshot.attributes.find(
                    (a) => a.attribute.key === "color",
                  );
                  const itemSize = orderItem.snapshot.attributes.find(
                    (a) => a.attribute.key === "size",
                  );
                  return (
                    <div key={orderItem.id}>
                      {idx > 0 && (
                        <div
                          className="mb-6"
                          style={{
                            borderTop: "1px solid rgba(74,78,105,0.11)",
                          }}
                        />
                      )}
                      <div className="flex items-center gap-4">
                        <div className="action-light-bg border-theme w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Package size={32} className="action-text" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="sub-text text-xs font-medium mb-1">
                            SKU: {orderItem.snapshot.sku}
                          </p>
                          <p className="heading-font text-base font-bold capitalize mb-2">
                            {orderItem.snapshot.productName}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {itemColor && (
                              <span className="border-theme description-text flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full">
                                <span
                                  className="w-2.5 h-2.5 rounded-sm inline-block"
                                  style={{ backgroundColor: itemColor.value }}
                                />
                                {itemColor.value}
                              </span>
                            )}
                            {itemSize && (
                              <span className="border-theme description-text text-xs px-2.5 py-1 rounded-full">
                                Size {itemSize.value}
                              </span>
                            )}
                            <span className="border-theme description-text text-xs px-2.5 py-1 rounded-full">
                              Qty: {orderItem.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <p className="heading-font text-lg font-bold">
                            {fmt(orderItem.subtotal)}
                          </p>
                          <p className="sub-text text-xs">
                            {fmt(orderItem.unitPrice)} × {orderItem.quantity}
                          </p>
                          <button className="p-1.5 rounded-lg transition-colors hover:bg-rose-50 group">
                            <Trash2
                              size={14}
                              className="text-rose-400 group-hover:text-rose-500"
                            />
                          </button>
                        </div>
                      </div>
                      <div
                        className="border-theme mt-4 pt-4 flex items-center gap-2"
                        style={{ borderTop: "1px solid" }}
                      >
                        <Tag size={12} className="sub-text" />
                        <span className="sub-text text-xs">
                          Shipping cost snapshot:{" "}
                          {fmt(orderItem.cogsSnapshot.shipping)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Order Summary */}
            <Card className="p-5 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 transition-colors hover-color"
                onClick={() => setSummaryOpen(!summaryOpen)}
              >
                <span className="heading-font text-sm font-bold">
                  Order Summary
                </span>
                <ChevronDown
                  size={16}
                  className={`sub-text transition-transform ${summaryOpen ? "rotate-180" : ""}`}
                />
              </button>
              {summaryOpen && (
                <div className="px-5 pb-5">
                  <div
                    className="pt-3"
                    style={{ borderTop: "1px solid rgba(74,78,105,0.11)" }}
                  >
                    <Row label="Subtotal" value={fmt(order.subtotal)} />
                    <Row
                      label="Shipping Fee"
                      value={
                        order.shippingFee === "0"
                          ? "Free"
                          : fmt(order.shippingFee)
                      }
                    />
                    <Row
                      label="Discount"
                      value={
                        order.discountTotal === "0"
                          ? "—"
                          : `-${fmt(order.discountTotal)}`
                      }
                    />
                    <Row
                      label="Tax"
                      value={order.taxTotal === "0" ? "—" : fmt(order.taxTotal)}
                    />
                    <Row
                      label="Promotions"
                      value={
                        order.promotions.length === 0
                          ? "None"
                          : order.promotions.length
                      }
                    />
                    <div
                      className="pt-3 mt-1"
                      style={{ borderTop: "1px solid rgba(74,78,105,0.11)" }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="heading-font text-base font-bold">
                          Grand Total
                        </span>
                        <span className="heading-font text-base font-bold">
                          {fmt(order.grandTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Status History */}
            <Card className="p-5">
              <SectionLabel>Status History</SectionLabel>
              <div className="flex flex-col gap-3">
                {order.statusHistory.map((h, idx) => (
                  <div key={h.id} className="flex gap-3 items-start">
                    <div className="flex flex-col items-center">
                      <div className="action w-2 h-2 rounded-full mt-1 flex-shrink-0" />
                      {idx < order.statusHistory.length - 1 && (
                        <div className="border-theme w-px flex-1 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusClasses[h.status] ?? ""}`}
                        >
                          {h.status}
                        </span>
                        <span className="sub-text text-xs">
                          {fmtDate(h.createdAt)}
                        </span>
                      </div>
                      <p className="description-text text-sm">{h.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Order Information */}
            <Card className="p-5">
              <SectionLabel>Order Information</SectionLabel>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: Hash,
                    label: "Order ID",
                    value: order.id.slice(0, 8) + "…",
                  },
                  {
                    icon: Hash,
                    label: "Order Number",
                    value: order.orderNumber,
                  },
                  {
                    icon: Clock,
                    label: "Created At",
                    value: fmtDate(order.createdAt),
                  },
                  {
                    icon: Clock,
                    label: "Last Updated",
                    value: fmtDate(order.updatedAt),
                  },
                  {
                    icon: Layers,
                    label: "Items",
                    value: `${order.items.length} item(s)`,
                  },
                  {
                    icon: CreditCard,
                    label: "Payments",
                    value:
                      order.payments.length === 0
                        ? "No payments yet"
                        : order.payments.length,
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="bg-primary flex items-start gap-3 p-3 rounded-xl"
                  >
                    <Icon
                      size={14}
                      className="action-text mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="sub-text text-[10px] uppercase tracking-wider font-medium mb-0.5">
                        {label}
                      </p>
                      <p className="heading-font text-xs font-semibold break-all">
                        {value as string}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="bg-primary border-theme mt-4 p-3 rounded-xl">
                  <p className="sub-text text-xs font-medium mb-1">Notes</p>
                  <p className="description-text text-sm">{order.notes}</p>
                </div>
              )}

              {order.cancelReason && (
                <div className="bg-rose-50 border border-rose-200 mt-4 p-3 rounded-xl">
                  <p className="text-rose-600 text-xs font-medium mb-1">
                    Cancel Reason
                  </p>
                  <p className="text-rose-700 text-sm">{order.cancelReason}</p>
                </div>
              )}
            </Card>
          </div>

          {/* ═══ RIGHT SIDEBAR (35%) ═══ */}
          <div className="flex flex-col gap-4" style={{ flex: "0 0 35%" }}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="heading-font text-sm font-bold">Customer</span>
                <ChevronDown size={14} className="sub-text" />
              </div>
              <div className="flex items-center gap-3">
                <div className="action w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                  {order.shippingSnapshot.recipientName.charAt(0)}
                </div>
                <div>
                  <p className="heading-font text-sm font-semibold">
                    {order.shippingSnapshot.recipientName}
                  </p>
                  <p className="sub-text text-xs">1 Order</p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="heading-font text-sm font-bold">
                  Customer Information
                </span>
                <Pencil size={13} className="action-text" />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <Mail size={13} className="sub-text" />
                  <span className="description-text text-xs">—</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={13} className="sub-text" />
                  <span className="description-text text-xs">
                    {order.shippingSnapshot.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <User size={13} className="sub-text" />
                  <span className="description-text text-xs">
                    {order.shippingSnapshot.recipientName}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="heading-font text-sm font-bold">
                  Shipping Address
                </span>
                <Pencil size={13} className="action-text" />
              </div>
              <div className="flex flex-col gap-1 mb-3">
                <p className="heading-font text-xs font-semibold">
                  {order.shippingSnapshot.recipientName}
                </p>
                <p className="description-text text-xs">
                  {order.shippingSnapshot.line1}
                </p>
                {order.shippingSnapshot.line2 && (
                  <p className="description-text text-xs">
                    {order.shippingSnapshot.line2}
                  </p>
                )}
                <p className="description-text text-xs">
                  {order.shippingSnapshot.city}, {order.shippingSnapshot.state}{" "}
                  {order.shippingSnapshot.postalCode}
                </p>
                <p className="description-text text-xs">
                  {order.shippingSnapshot.country}
                </p>
              </div>
              <div
                className="pt-3"
                style={{ borderTop: "1px solid rgba(74,78,105,0.11)" }}
              >
                <button className="action-text flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70">
                  <MapPin size={11} />
                  View on map
                </button>
              </div>
            </Card>

            <Card className="p-5 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 transition-colors hover-color"
                onClick={() => setBillingOpen(!billingOpen)}
              >
                <span className="heading-font text-sm font-bold">
                  Billing Address
                </span>
                <ChevronDown
                  size={14}
                  className={`sub-text transition-transform ${billingOpen ? "rotate-180" : ""}`}
                />
              </button>
              {!billingOpen ? (
                <p className="sub-text px-5 pb-4 text-xs">
                  Same as shipping address
                </p>
              ) : (
                <div
                  className="px-5 pb-4 pt-3"
                  style={{ borderTop: "1px solid rgba(74,78,105,0.11)" }}
                >
                  <div className="flex flex-col gap-1">
                    <p className="description-text text-xs">
                      {order.shippingSnapshot.line1}
                    </p>
                    {order.shippingSnapshot.line2 && (
                      <p className="description-text text-xs">
                        {order.shippingSnapshot.line2}
                      </p>
                    )}
                    <p className="description-text text-xs">
                      {order.shippingSnapshot.city},{" "}
                      {order.shippingSnapshot.state}
                    </p>
                    <p className="description-text text-xs">
                      {order.shippingSnapshot.country}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="heading-font text-sm font-bold">Shipment</span>
              </div>
              <div className="bg-primary flex items-center gap-2 py-3 px-3 rounded-xl">
                <Package size={13} className="sub-text" />
                <span className="sub-text text-xs">
                  {order.shipment
                    ? "Shipment assigned"
                    : "No shipment assigned yet"}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
