import type { VariantPayload } from "@/TypeDefinitions/ModalType";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import DynamicVariantTabs from "@/components/DynamicTabs";

export type VariantTabProps = {
  index: number;
  data: VariantPayload;
  attributeDefinitions: { id: string; name: string }[];
  cogsDefinitions: { id: string; name: string; key: string }[];
  onChange: (index: number, field: keyof VariantPayload, value: any) => void;
  onRemove: (index: number) => void;
  isOnly: boolean;
};

export function VariantTab({
  index,
  data,
  attributeDefinitions,
  cogsDefinitions,
  onChange,
  onRemove,
  isOnly,
}: VariantTabProps) {
  
  return (
    <div className="rounded-xl border border-border/60 bg-secondary p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold description-text uppercase tracking-wider">
          Variant {index + 1}
        </span>
        {!isOnly && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-xs text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
          >
            ✕ Remove
          </button>
        )}
      </div>

      {/* SKU */}
      <div className="space-y-1">
        <Label className="description-text text-xs">SKU</Label>
        <Input
          type="text"
          placeholder="Enter SKU"
          value={data.sku}
          onChange={(e) => onChange(index, "sku", e.target.value)}
          className="description-text"
        />
      </div>

      {/* Price + Stock */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="description-text text-xs">Price</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={data.price}
            onChange={(e) =>
              onChange(
                index,
                "price",
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            className="description-text"
          />
        </div>
        <div className="space-y-1">
          <Label className="description-text text-xs">Stock</Label>
          <Input
            type="number"
            disabled={data?.id ? true : false}
            placeholder="0"
            value={data.stock}
            onChange={(e) =>
              onChange(
                index,
                "stock",
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            className="description-text"
          />
        </div>
      </div>

      {/* Attributes — uses DynamicVariantTabs driven by attributeDefinitions */}
      <div className="space-y-1">
        <Label className="description-text text-xs">Attributes</Label>
        {attributeDefinitions.length > 0 ? (
          <DynamicVariantTabs
            attributeDefinitions={attributeDefinitions}
            value={data.attributes}
            onChange={(val) => onChange(index, "attributes", val)}
          />
        ) : (
          <p className="text-xs text-muted-foreground italic px-1">
            No attribute definitions found.
          </p>
        )}
      </div>

      {/* COGS Data — definition-driven: fixed keys, user enters values only */}
      <div className="space-y-1">
        <Label className="description-text text-xs">COGS Data</Label>
        {cogsDefinitions.length > 0 ? (
          <DynamicVariantTabs
            attributeDefinitions={cogsDefinitions}
            value={data.cogsData}
            onChange={(val) => onChange(index, "cogsData", val)}
          />
        ) : (
          <p className="text-xs text-muted-foreground italic px-1">
            No COGS definitions found.
          </p>
        )}
      </div>
    </div>
  );
}
