import { useState, useMemo, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Search,
  ScanLine,
  Loader2,
  Minus,
  Plus,
  Trash2,
  UserPlus,
  X,
  Banknote,
  CreditCard,
  ArrowLeftRight,
  Eye,
  ShoppingCart,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
// import { BrandService } from "../../services/BrandService";
// import { CategoryService } from "../../services/CategoryService";

import { CategoryService } from "@/services/OrderManagement/Category";
import { BrandService } from "@/services/OrderManagement/BrandService";
import {
  ProductService,
  type ProductFilterParams,
} from "@/services/OrderManagement/ProductService";
import { toast } from "react-toastify";
import type {
  CartItem,
  CheckoutFormValues,
  CheckoutPayload,
  PaymentMethod,
} from "@/TypeDefinitions/Pos";
import { PosService } from "@/services/OrderManagement/PosService";

const ITEMS_PER_PAGE = 12;

// ─── Types ─────────────────────────────────────────────────────────────────

/**
 * Exact payload shape requested for the checkout submission.
 * outletId / customerId / cashierId are placeholder random strings for now —
 * swap the TODOs in handleConfirmOrder for real values once auth/outlet/customer
 * context is wired up.
 */

// ─── Helpers ───────────────────────────────────────────────────────────────

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// Sum the quantity of every variant's stock rows whose status is "available"
function getAvailableStock(product: any): number {
  return (product.variants ?? []).reduce((sum: number, variant: any) => {
    const variantAvailable = (variant.stocks ?? [])
      .filter((s: any) => s.stockStatusType?.code === "AVAILABLE")
      .reduce((s: number, stock: any) => s + (stock.quantity ?? 0), 0);
    return sum + variantAvailable;
  }, 0);
}

function getVariantAvailableStock(variant: any): number {
  return (variant.stocks ?? [])
    .filter((s: any) => s.stockStatusType?.code === "AVAILABLE")
    .reduce((sum: number, s: any) => sum + (s.quantity ?? 0), 0);
}

// Pick the variant to add to cart: the cheapest variant that currently has
// available stock, falling back to the cheapest variant overall if none do.
function getDefaultVariant(product: any) {
  const variants = product.variants ?? [];
  if (!variants.length) return null;

  const inStock = variants.filter((v: any) =>
    (v.stocks ?? []).some(
      (s: any) => s.stockStatusType?.code === "AVAILABLE" && s.quantity > 0,
    ),
  );
  const pool = inStock.length ? inStock : variants;

  return pool.reduce(
    (cheapest: any, v: any) =>
      Number(v.price) < Number(cheapest.price) ? v : cheapest,
    pool[0],
  );
}

// Pull the "shipping" cogs entry's value out of a variant's cogsData array
function getShippingCost(variant: any) {
  const shippingEntry = (variant.cogsData ?? []).find(
    (c: any) => c.name?.toLowerCase() === "shipping",
  );
  return shippingEntry?.value;
}

// Sort a variant's images by sortOrder, falling back to the product image
function getVariantImages(variant: any, fallback: string) {
  if (!variant?.images?.length) return [fallback];
  return [...variant.images]
    .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
    .map((img: any) => img.url);
}

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  icon: typeof Banknote;
}[] = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "transfer", label: "Transfer", icon: ArrowLeftRight },
];

// ─── Product card ──────────────────────────────────────────────────────────

function POSProductCard({
  product,
  onViewDetails,
}: {
  product: any;
  onViewDetails: () => void;
}) {
  const stock = getAvailableStock(product);
  const outOfStock = stock === 0;
  const lowStock = !outOfStock && stock <= 10;

  // Not present in the current product payload — wire up once the API returns it
  const discountPercentage = product.discountPercentage as number | undefined;

  // Actual price to display — the price of the variant that would be added to cart
  const defaultVariant = getDefaultVariant(product);
  const price = defaultVariant ? Number(defaultVariant.price) : 0;

  return (
    <div className="bg-primary rounded-2xl border border-stone-200/70 shadow-sm p-3 flex flex-col">
      <div className="relative aspect-square rounded-xl bg-stone-50 overflow-hidden mb-3">
        {discountPercentage ? (
          <span className="absolute top-2 left-2 z-10 action text-white text-[10px] font-black px-2 py-1 rounded-full">
            -{discountPercentage}%
          </span>
        ) : null}
        <img
          src={product.productImage}
          alt={product.productName}
          className="w-full h-full object-contain"
        />
      </div>

      <p className="sub-text line-clamp-2 mb-1 min-h-[2.5em]">
        {product.productName}
      </p>

      <div className="flex items-baseline gap-2 mb-1">
        <p className="sub-text">{price}</p>
      </div>

      <p
        className={`text-[11px] font-bold mb-3 ${
          outOfStock
            ? "text-red-500"
            : lowStock
              ? "text-amber-500"
              : "text-emerald-600"
        }`}
      >
        {outOfStock
          ? "Out of stock"
          : lowStock
            ? `Only ${stock} items left`
            : `${stock} in stock`}
      </p>

      <button
        type="button"
        onClick={onViewDetails}
        className="mt-auto h-9 rounded-full border border-stone-900 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-stone-900 hover:text-white transition-colors"
      >
        <Eye size={12} strokeWidth={3} />
        View details
      </button>
    </div>
  );
}

// ─── Product detail modal ───────────────────────────────────────────────────
// Ported from the standalone ProductDetail page: same fetch-by-id + variant /
// stock / attribute logic, minus the breadcrumb and "related products" rail.
// Adding to cart here writes into the same `cart` state the POS panel and
// checkout modal already use, so the rest of the flow is unchanged.

function ProductDetailModal({
  open,
  productId,
  cartItems,
  onClose,
  onAddToCart,
}: {
  open: boolean;
  productId: string | null;
  cartItems: CartItem[];
  onClose: () => void;
  onAddToCart: (product: any, variant: any, quantity: number) => void;
}) {
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product-detail", productId],
    queryFn: () => ProductService.getById(productId!),
    enabled: open && !!productId,
  });

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState<string | null>(null);

  const selectedVariant =
    product?.variants?.find((v: any) => v.id === selectedVariantId) ||
    product?.variants?.[0];

  const existingCartItem = cartItems.find(
    (i) => i.variantId === selectedVariant?.id,
  );

  // Fresh state every time the modal is opened for a (possibly new) product
  useEffect(() => {
    if (open) {
      setSelectedVariantId(null);
    }
  }, [open, productId]);

  // Reset active image + quantity whenever the selected variant changes
  useEffect(() => {
    if (!selectedVariant) return;
    const images = getVariantImages(selectedVariant, product?.productImage);
    setActiveImg(images[0]);
    setQuantity(existingCartItem ? existingCartItem.quantity : 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant?.id]);

  if (!open) return null;

  const variantStock = selectedVariant
    ? getVariantAvailableStock(selectedVariant)
    : 0;
  const totalStock = product ? getAvailableStock(product) : 0;
  const isLowStock = variantStock > 0 && variantStock <= 5;
  const shippingCost = selectedVariant
    ? getShippingCost(selectedVariant)
    : undefined;
  const variantImages = selectedVariant
    ? getVariantImages(selectedVariant, product?.productImage)
    : [];
  const currentImg = activeImg || product?.productImage;

  const handleAdd = () => {
    if (!product || !selectedVariant) return;
    onAddToCart(product, selectedVariant, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-primary rounded-2xl w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100 sticky top-0 bg-primary z-10">
          <h2 className="heading-font text-lg font-black">Product details</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-stone-50 hover:bg-stone-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={28} className="animate-spin sub-text opacity-40" />
            <p className="text-xs font-black uppercase tracking-[0.15em] sub-text">
              Loading product…
            </p>
          </div>
        ) : error || !product || !selectedVariant ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-sm text-red-500 font-semibold">
              Failed to load product details.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Images */}
            <div>
              <div className="relative rounded-xl bg-stone-50 overflow-hidden aspect-square mb-3">
                <img
                  src={currentImg}
                  alt={product.productName}
                  className="w-full h-full object-contain"
                />
              </div>
              {variantImages.length > 1 && (
                <div className="flex gap-2">
                  {variantImages.map((img: string, i: number) => (
                    <button
                      key={`${img}-${i}`}
                      type="button"
                      onClick={() => setActiveImg(img)}
                      className={`rounded-lg overflow-hidden bg-stone-50 border flex-1 aspect-square transition-colors ${
                        currentImg === img
                          ? "border-stone-900"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`View ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] sub-text mb-1">
                  {product.productCategory?.categoryName}
                </p>
                <h3 className="heading-font text-xl font-black capitalize">
                  {product.productName}
                </h3>
              </div>

              <div>
                <p className="text-2xl font-black">{selectedVariant.price}</p>
                {shippingCost !== undefined && (
                  <p className="text-xs sub-text mt-1">
                    + shipping {shippingCost}
                  </p>
                )}
              </div>

              {/* Variant selector */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] sub-text mb-2">
                  Select variant
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant: any) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`h-9 px-4 rounded-full text-xs font-bold border transition-colors ${
                        selectedVariant.id === variant.id
                          ? "action text-white border-transparent"
                          : "bg-primary border-stone-200 sub-text hover:border-stone-300"
                      }`}
                    >
                      {variant.sku}
                    </button>
                  ))}
                </div>
              </div>

              {/* Attributes (size, color, etc.) for the selected variant */}
              {selectedVariant.attributes?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedVariant.attributes.map((attr: any) => (
                    <span
                      key={attr.id}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-stone-100 sub-text capitalize"
                    >
                      {attr.attribute?.name}: {attr.value}
                    </span>
                  ))}
                </div>
              )}

              {/* Stock indicator */}
              <div>
                <div className="flex items-center justify-between text-xs sub-text mb-1.5">
                  <span>Stock: {variantStock} units</span>
                  <span
                    className={`font-bold ${
                      variantStock === 0
                        ? "text-red-500"
                        : isLowStock
                          ? "text-amber-500"
                          : "text-emerald-600"
                    }`}
                  >
                    {variantStock === 0
                      ? "Out of stock"
                      : isLowStock
                        ? "Low stock"
                        : "In stock"}
                  </span>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${
                        totalStock > 0
                          ? Math.min((variantStock / totalStock) * 100, 100)
                          : 0
                      }%`,
                      background: isLowStock ? "#f59e0b" : "#16a34a",
                    }}
                  />
                </div>
              </div>

              {/* Quantity + Add to cart */}
              <div className="flex gap-3 mt-auto pt-2">
                <div className="flex items-center gap-1 border border-stone-200 rounded-full px-2 py-1">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 flex items-center justify-center hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= (variantStock || Infinity)}
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(variantStock || Infinity, q + 1),
                      )
                    }
                    className="w-7 h-7 flex items-center justify-center hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={variantStock === 0}
                  className="flex-1 h-11 rounded-full bg-secondary text-white text-sm font-bold hover:scale-103 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={15} />
                  {variantStock === 0
                    ? "Out of stock"
                    : existingCartItem
                      ? "Update cart"
                      : "Add to cart"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Cart panel ────────────────────────────────────────────────────────────

function CartPanel({
  cart,
  subtotal,
  fulfilment,
  onFulfilmentChange,
  onIncrement,
  onDecrement,
  onRemove,
  onClearCart,
  onCheckout,
}: {
  cart: CartItem[];
  subtotal: number;
  fulfilment: "walkin" | "delivery";
  onFulfilmentChange: (mode: "walkin" | "delivery") => void;
  onIncrement: (variantId: string) => void;
  onDecrement: (variantId: string) => void;
  onRemove: (variantId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}) {
  return (
    <div className="w-[380px] flex-none border-l border-stone-200 bg-primary flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <h2 className="heading-font text-lg font-black">
          Cart ({cart.length})
        </h2>
        <button
          type="button"
          onClick={onClearCart}
          disabled={cart.length === 0}
          className="text-xs font-bold action-text hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Clear cart
        </button>
      </div>

      {/* Add customer */}
      <div className="px-6">
        <button
          type="button"
          className="w-full h-11 rounded-xl border border-dashed border-stone-300 text-xs font-bold sub-text flex items-center justify-center gap-2 hover:border-stone-400 hover:text-stone-700 transition-colors"
        >
          <UserPlus size={14} />
          Add customer
        </button>
      </div>

      {/* Fulfilment */}
      <div className="px-6 pt-5 pb-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] sub-text mb-2">
          Fulfilment
        </p>
        <div className="flex bg-stone-100 rounded-full p-1">
          {(["walkin", "delivery"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onFulfilmentChange(mode)}
              className={`flex-1 h-8 rounded-full text-xs font-bold transition-colors ${
                fulfilment === mode ? "bg-stone-900 text-white" : "sub-text"
              }`}
            >
              {mode === "walkin" ? "Walk in" : "Delivery"}
            </button>
          ))}
        </div>
      </div>

      {/* Line items */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {cart.length === 0 ? (
          <p className="text-xs sub-text text-center py-16 leading-relaxed">
            Cart is empty.
            <br />
            Add products from the left to get started.
          </p>
        ) : (
          cart.map((item) => (
            <div key={item.variantId} className="flex gap-3">
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-12 h-12 rounded-lg object-cover bg-stone-50 flex-none"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {item.productName}
                </p>
                <p className="text-xs sub-text mb-2">
                  {item.quantity} × {item.unitPrice}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-200 rounded-full">
                    <button
                      type="button"
                      onClick={() => onDecrement(item.variantId)}
                      className="w-6 h-6 flex items-center justify-center hover:text-stone-900"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="w-6 text-center text-xs font-bold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onIncrement(item.variantId)}
                      className="w-6 h-6 flex items-center justify-center hover:text-stone-900"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(item.variantId)}
                    className="text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals + checkout */}
      <div className="border-t border-stone-100 p-6 space-y-2">
        <div className="flex justify-between text-sm sub-text">
          <span>Subtotal</span>
          <span>{subtotal}</span>
        </div>
        <div className="flex justify-between text-sm sub-text">
          <span>Discount</span>
          <span>{0}</span>
        </div>
        <div className="flex justify-between text-base font-black pt-1">
          <span>Total</span>
          <span>{subtotal}</span>
        </div>

        <button
          type="button"
          onClick={onCheckout}
          disabled={cart.length === 0}
          className="w-full h-12 rounded-xl action text-white text-sm font-bold mt-3 hover:bg-[var(--action-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Checkout · {subtotal}
        </button>
      </div>
    </div>
  );
}

// ─── Checkout modal (RHF) ──────────────────────────────────────────────────

function CheckoutModal({
  open,
  onClose,
  cartItems,
  subtotal,
}: {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  onConfirm: (payload: CheckoutPayload) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    defaultValues: { paymentMethod: "cash", discountAmount: 0, note: "" },
  });

  // Reset the form fresh every time the modal is opened for a new order
  useEffect(() => {
    if (open) reset({ paymentMethod: "cash", discountAmount: 0, note: "" });
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: (data: CheckoutPayload) => PosService.checkout(data),
    onSuccess: () => {
      toast.success("Order Placed Successfully!!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const discountAmount = Number(watch("discountAmount")) || 0;
  const total = Math.max(subtotal - discountAmount, 0);

  const onSubmit = (values: CheckoutFormValues) => {
    const payload: CheckoutPayload = {
      cashierId: crypto.randomUUID(),
      paymentMethod: values.paymentMethod,
      items: cartItems.map((item) => ({
        vid: item.variantId,
        quantity: item.quantity,
      })),
      paidAmount: subtotal,
      discountAmount: Number(values.discountAmount) || 0,
      note: values.note.trim(),
    };
    mutation.mutate(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-primary rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100 sticky top-0 bg-primary">
          <h2 className="heading-font text-lg font-black">Confirm order</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-stone-50 hover:bg-stone-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          {/* Payment method */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.12em] sub-text mb-2">
              Payment method
            </label>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_OPTIONS.map(({ value, label, icon: Icon }) => {
                    const active = field.value === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={`h-16 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-colors ${
                          active
                            ? "action text-white border-transparent"
                            : "bg-primary border-stone-200 sub-text hover:border-stone-300"
                        }`}
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {/* Discount */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.12em] sub-text mb-2">
              Discount amount (₦)
            </label>
            <input
              type="number"
              min={0}
              max={subtotal}
              step="1"
              placeholder="0"
              className="w-full h-11 px-4 rounded-xl bg-primary border border-stone-200 text-sm focus:ring-1 focus:ring-[var(--action--color)] focus:border-[var(--action--color)]"
              style={{ outline: "none" }}
              {...register("discountAmount", {
                valueAsNumber: true,
                min: { value: 0, message: "Discount can't be negative" },
                max: {
                  value: subtotal,
                  message: "Discount can't exceed the subtotal",
                },
              })}
            />
            {errors.discountAmount && (
              <p className="text-red-500 text-xs mt-1">
                {errors.discountAmount.message}
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.12em] sub-text mb-2">
              Note
            </label>
            <textarea
              rows={3}
              placeholder="Add a note for this order (optional)"
              className="w-full px-4 py-3 rounded-xl bg-primary border border-stone-200 text-sm resize-none focus:ring-1 focus:ring-[var(--action--color)] focus:border-[var(--action--color)]"
              style={{ outline: "none" }}
              {...register("note")}
            />
          </div>

          {/* Totals */}
          <div className="bg-stone-50 rounded-xl p-4 space-y-1.5">
            <div className="flex justify-between text-sm sub-text">
              <span>Subtotal</span>
              <span>{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm sub-text">
              <span>Discount</span>
              <span>-{discountAmount}</span>
            </div>
            <div className="flex justify-between text-base font-black pt-1 border-t border-stone-200 mt-1.5">
              <span>Total</span>
              <span>{total}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || cartItems.length === 0}
            className="w-full h-12 rounded-xl action text-white text-sm font-bold hover:bg-[var(--action-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm &amp; place order · {total}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function PosCheckout() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [fulfilment, setFulfilment] = useState<"walkin" | "delivery">("walkin");
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeCategory]);

  const { data: categoryData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => CategoryService.getAll(),
  });

  // Kept for parity with the original page — not directly rendered here, but
  // available if brand filtering/labels are added back in later.
  useQuery({ queryKey: ["brands"], queryFn: () => BrandService.getAll() });

  const filterParams = useMemo((): ProductFilterParams => {
    return {
      search: debouncedSearch.trim() || undefined,
      categoryIds: activeCategory ? [activeCategory] : undefined,
      includeSubCategories: activeCategory ? true : undefined,
      page: currentPage,
      pageSize: ITEMS_PER_PAGE,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
  }, [debouncedSearch, activeCategory, currentPage]);

  const {
    data: productResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["products", filterParams],
    queryFn: () => ProductService.filter(filterParams),
    placeholderData: (prev) => prev,
  });

  const products = productResponse?.data ?? [];

  const flattenCategories = (
    categories: any[],
  ): { id: string; name: string }[] => {
    return categories.flatMap((category) => [
      {
        id: category.id,
        name: category.categoryName,
      },
      ...flattenCategories(category.subCategories ?? []),
    ]);
  };

  const categories = useMemo(() => {
    return [
      { id: null as string | null, name: "All Products" },
      ...flattenCategories(categoryData ?? []),
    ];
  }, [categoryData]);

  // ─── Cart actions ────────────────────────────────────────────────────────

  // Called from the product detail modal: adds the exact variant + quantity
  // the cashier picked, or overwrites the quantity if that variant is
  // already sitting in the cart.
  const addVariantToCart = useCallback(
    (product: any, variant: any, quantity: number) => {
      const stock = getVariantAvailableStock(variant);
      const cappedQty = stock ? Math.min(quantity, stock) : quantity;

      setCart((prev) => {
        const existing = prev.find((item) => item.variantId === variant.id);
        if (existing) {
          return prev.map((item) =>
            item.variantId === variant.id
              ? { ...item, quantity: cappedQty }
              : item,
          );
        }
        return [
          ...prev,
          {
            variantId: variant.id,
            productId: product.id,
            productName: product.productName,
            productImage: variant.images?.[0]?.url || product.productImage,
            sku: variant.sku,
            unitPrice: Number(variant.price),
            quantity: cappedQty,
            availableStock: stock,
          },
        ];
      });
    },
    [],
  );

  const changeQuantity = useCallback((variantId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.variantId !== variantId) return item;
        const max = item.availableStock || Infinity;
        const nextQty = Math.min(Math.max(item.quantity + delta, 1), max);
        return { ...item, quantity: nextQty };
      }),
    );
  }, []);

  const removeFromCart = useCallback((variantId: string) => {
    setCart((prev) => prev.filter((item) => item.variantId !== variantId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart],
  );

  const handleConfirmOrder = useCallback(
    (payload: CheckoutPayload) => {
      // TODO: replace with the real submission, e.g.
      // await OrderService.create(payload);
      console.log("Submitting order:", payload);
      setCheckoutOpen(false);
      clearCart();
    },
    [clearCart],
  );

  return (
    <div className="bg-primary min-h-screen heading-font flex">
      {/* ── Left: product browser ─────────────────────────────────────── */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-black mb-6">Checkout</h1>

        {/* Search */}
        <div className="relative mb-5" style={{ maxWidth: 460 }}>
          <Search
            size={16}
            className="absolute left-5 top-1/2 -translate-y-1/2 sub-text pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search products or scan barcode"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-12 rounded-full bg-primary border border-stone-200 shadow-sm description-text text-sm font-light focus:ring-1 focus:ring-[var(--action--color)] focus:border-[var(--action--color)] transition-all"
            style={{ outline: "none" }}
          />
          <ScanLine
            size={16}
            className="absolute right-5 top-1/2 -translate-y-1/2 sub-text pointer-events-none"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.id ?? "all"}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 h-9 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? "action text-white"
                  : "bg-primary border border-stone-200 sub-text hover:border-stone-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
          {isFetching && (
            <Loader2
              size={16}
              className="animate-spin sub-text opacity-50 self-center"
            />
          )}
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4 bg-primary rounded-2xl border border-stone-200/50 shadow-sm">
            <Loader2
              size={32}
              strokeWidth={1.5}
              className="sub-text opacity-40 animate-spin"
            />
            <p className="text-xs font-black uppercase tracking-[0.15em] sub-text">
              Loading products…
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4 bg-primary rounded-2xl border border-stone-200/50 shadow-sm">
            <Search
              size={32}
              strokeWidth={1.5}
              className="sub-text opacity-40"
            />
            <p className="text-xs font-black uppercase tracking-[0.15em] sub-text">
              No products match your search
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product: any) => (
                <POSProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={() => setSelectedProductId(product.id)}
                />
              ))}
            </div>

            {/* {productResponse?.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
                >
                  Prev
                </button>
                {Array.from({ length: productResponse.totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border rounded cursor-pointer ${
                      currentPage === i + 1 ? "bg-stone-900 text-white" : ""
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === productResponse.totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )} */}
          </>
        )}
      </div>

      {/* ── Right: cart ────────────────────────────────────────────────── */}
      <CartPanel
        cart={cart}
        subtotal={subtotal}
        fulfilment={fulfilment}
        onFulfilmentChange={setFulfilment}
        onIncrement={(vid) => changeQuantity(vid, 1)}
        onDecrement={(vid) => changeQuantity(vid, -1)}
        onRemove={removeFromCart}
        onClearCart={clearCart}
        onCheckout={() => setCheckoutOpen(true)}
      />

      <ProductDetailModal
        open={!!selectedProductId}
        productId={selectedProductId}
        cartItems={cart}
        onClose={() => setSelectedProductId(null)}
        onAddToCart={addVariantToCart}
      />

      <CheckoutModal
        open={isCheckoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cart}
        subtotal={subtotal}
        onConfirm={handleConfirmOrder}
      />
    </div>
  );
}
