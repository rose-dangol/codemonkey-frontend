{
  /* todo: refactor all types */
}

// ─── Stock Status Type ────────────────────────────────────────────────────────

export interface StockStatusType {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Variant Stock Bucket ─────────────────────────────────────────────────────

export interface VariantStockBucket {
  id: string;
  variantId: string;
  stockStatusTypeId: string;
  quantity: number;
  updatedAt: string;
  stockStatusType: StockStatusType;
}

// ─── Inventory Overview Row ───────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  productId: string;
  sku: string;
  price: number;
  cogsData?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    productName: string;
    productImage: string | null;
    isHidden: boolean;
    brandId: string | null;
    categoryId: string | null;
  };
  attributes: {
    id: string;
    variantId: string;
    attributeId: string;
    value: string;
    attribute: {
      name: string;
      type: string;
    };
  }[];
  stock: VariantStockBucket[];
  stockByCode: Record<string, number>;
  totalStock: number;
  inventoryStatus: string;
}
export interface InventoryVariantDetail {
  transactions: Partial<InventoryTransaction>[];
  variant: InventoryItem;
}

// ─── Inventory Transaction ────────────────────────────────────────────────────

export interface InventoryTransaction {
  id: string;
  variantId: string;
  fromStockStatusTypeId: string | null;
  fromStockStatusType: StockStatusType | null;
  toStockStatusTypeId: string;
  toStockStatusType: StockStatusType;
  quantity: number;
  referenceId: string | null;
  referenceType: string | null;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
  variant: {
    id: string;
    sku: string;
    product: {
      productName: string;
      productImage: string | null;
    };
  };
}

// ─── Dashboard Summary ────────────────────────────────────────────────────────

export interface InventoryDashboardSummary {
  totalProducts: number;
  totalVariants: number;
  totalAvailableStock: number;
  totalDamagedStock: number;
  totalReservedStock: number;
  lowStockVariants: number;
  outOfStockVariants: number;
}

// ─── Action Payloads ──────────────────────────────────────────────────────────

export interface RestockPayload {
  variantId: string;
  toStockStatusTypeId: string;
  quantity: number;
  note?: string;
}

export interface TransferPayload {
  variantId: string;
  fromStockStatusTypeId: string;
  toStockStatusTypeId: string;
  quantity: number;
  note?: string;
}

export interface AdjustPayload {
  variantId: string;
  stockStatusTypeId: string;
  targetQuantity: number;
  note?: string;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface InventoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  sku?: string;
  statusCode?: string;
}

export interface TransactionListParams {
  variantId?: string;
  page?: number;
  limit?: number;
  search?: string;
  sku?: string;
  fromDate?: string;
  toDate?: string;
  transactionType?: string;
  createdBy?: string;
}

// ─── Paginated Response ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
