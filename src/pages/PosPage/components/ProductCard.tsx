import { Heart } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export function ProductCard({ product }: { product: any }) {
  const [wished, setWished] = useState(false);

  // 1. Calculate variant pricing safely
  const pricingData = useMemo(() => {
    // Safely check if product AND product.variants exist
    const hasVariants = product?.variants && product.variants.length > 0;

    if (!hasVariants) {
      return {
        hasVariants: false,
        originalPrice: 0,
        discountedPrice: 0,
        inStock: false,
      };
    }

    const firstVariant = product.variants[0];
    const originalPrice = Number(firstVariant.price);

    const randomDeduction = Math.floor(Math.random() * (500 - 300 + 1)) + 300;
    const discountedPrice = Math.max(0, originalPrice - randomDeduction);

    return {
      hasVariants: true,
      originalPrice,
      discountedPrice,
      inStock: firstVariant.stock > 0,
    };
  }, [product?.variants]); // Watch changes to the variants array safely

  // 2. Early Return Guard: If product is completely missing, don't render anything
  if (!product) {
    return null;
  }
  return (
    <Link
      to={`/product/${product.id}`}
      className="card flex flex-col overflow-hidden group transition-all duration-500 hover:-translate-y-1.5 border border-stone-200/50 bg-white"
    >
      {/* Image Containers */}
      <div
        className="relative overflow-hidden bg-stone-50"
        style={{ aspectRatio: "4/4.5", borderRadius: "0.9rem 0.9rem 0 0" }}
      >
        <img
          src={product.productImage}
          alt={product.productName}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Wishlist Button Overlay */}
        {pricingData.hasVariants && (
          <button
            onClick={() => setWished(!wished)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center border border-stone-200/40 cursor-pointer transition-all hover:scale-110 active:scale-95 shadow-sm"
            style={{ color: wished ? "#b91c1c" : "var(--color-subtext)" }}
          >
            <Heart
              size={14}
              strokeWidth={wished ? 0 : 2}
              fill={wished ? "currentColor" : "none"}
            />
          </button>
        )}

        {/* Out of stock cover layout */}
        {product?.quantity === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/40 backdrop-blur-[2px]">
            <span className="bg-white text-stone-900 border border-stone-300 text-[10px] font-black uppercase tracking-[0.15em] px-4 py-2 rounded shadow-md">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info Grid */}
      <div className="p-4.5 flex flex-col gap-1 flex-1 bg-white">
        <span className="sub-text text-[10px] font-bold tracking-[0.2em] uppercase opacity-75">
          {product?.brand?.brandName || "Brand"}
        </span>

        <h3 className="heading-font text-base font-bold leading-snug group-hover:text-[var(--action--color)] transition-colors duration-300">
          {product.productName}
        </h3>

        <p className="sub-text text-xs font-light leading-relaxed line-clamp-2 mt-0.5">
          this is a static test product description
        </p>

        {/* Stars Accent */}
        <div className="flex items-center gap-0.5 mt-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <svg
              key={s}
              width="11"
              height="11"
              viewBox="0 0 24 24"
              className={s <= 4 ? "text-amber-500" : "text-stone-200"}
              fill="currentColor"
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          ))}
          <span className="sub-text text-[10px] font-semibold ml-1.5 tabular-nums">
            4.5 (178)
          </span>
        </div>

        {/* Price layout context */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
          {pricingData.hasVariants ? (
            <div className="flex flex-col">
              {/* <span className="sub-text text-[11px] font-light line-through mb-0.5 opacity-80">
                Rp {pricingData.originalPrice.toLocaleString("id-ID")}
              </span> */}
              <span className="heading-font text-base font-extrabold tracking-tight text-stone-900">
                Rs {pricingData.originalPrice.toLocaleString("id-ID")}
              </span>
            </div>
          ) : (
            /* Coming Soon Status fallback when no variants exist */
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200/60 animate-pulse">
                Coming Soon
              </span>
            </div>
          )}

          {/* <div className="flex items-center gap-3">
            <button
              disabled={!pricingData.inStock}
              className={`w-9 h-9 rounded-full flex items-center justify-center border-0 cursor-pointer transition-all shadow-sm ${
                pricingData.inStock
                  ? "action-light-bg action-text hover:bg-[var(--action--color)] hover:text-white hover:scale-105 active:scale-95"
                  : "bg-stone-100 text-stone-400 cursor-not-allowed opacity-50"
              }`}
            >
              <ShoppingCart size={13} strokeWidth={2} />
            </button>
          </div> */}
        </div>
      </div>
      <div className="block mt-4">
        <span className="action-text text-xs font-bold uppercase tracking-widest hover:underline transition-all">
          View Details →
        </span>
      </div>
    </Link>
  );
}
