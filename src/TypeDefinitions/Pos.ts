export interface CheckoutPayload {
  cashierId: string;
  paymentMethod: PaymentMethod;
  items: { vid: string; quantity: number }[];
  discountAmount: number;
  note: string;
  paidAmount: number;
}

export interface CheckoutFormValues {
  paymentMethod: PaymentMethod;
  discountAmount: number;
  note: string;
}


export type PaymentMethod = "cash" | "card" | "transfer";

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  /** Total quantity currently marked "available" for this variant, 0 = unlimited/unknown */
  availableStock: number;
}

