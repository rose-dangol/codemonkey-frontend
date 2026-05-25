export type ShippingSnapshotType = {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export type OrderType = {
  id?: string;

  orderNumber: string;

  customerId?: string | null;

  shippingAddressId?: string | null;
  shippingSnapshot?: ShippingSnapshotType | null;

  shippingMethodId?: string | null;

  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED";

  paymentStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "REFUNDED" | "FAILED";

  subtotal: number;

  shippingFee?: number;

  discountTotal?: number;

  taxTotal?: number;

  grandTotal: number;

  notes?: string | null;

  cancelReason?: string | null;
  items?: OrderType[];

  createdAt?: string;
  updatedAt?: string;
};
