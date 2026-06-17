import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import DynamicVariantTabs from "@/components/DynamicTabs";
import { Controller, useWatch } from "react-hook-form";
import { MultiImageField } from "./MultiImageField";

export type VariantTabProps = {
  index: number;
  control: any;
  remove: (index: number) => void;
  attributeDefinitions: { id: string; name: string }[];
  cogsDefinitions: { id: string; name: string; key: string }[];
  isOnly: boolean;
};

export function VariantTab({
  index,
  control,
  remove,
  attributeDefinitions,
  cogsDefinitions,
  isOnly,
}: VariantTabProps) {
  const stock = useWatch({
    control,
    name: `variants.${index}.stocks.0`,
  });
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
            onClick={() => remove(index)}
            className="text-xs text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
          >
            ✕ Remove
          </button>
        )}
      </div>

      {/* SKU */}
      <div className="space-y-1">
        <Label className="description-text text-xs">SKU</Label>
        <Controller
          name={`variants.${index}.sku`}
          control={control}
          render={({ field }) => <Input {...field} placeholder="Enter SKU" />}
        />
      </div>

      <div className="space-y-2 my-4">
        <Controller
          name={`variants.${index}.images`}
          control={control}
          defaultValue={[]}
          rules={{
            validate: (val) =>
              (Array.isArray(val) &&
                val.length > 0 &&
                val.some((img: any) => img.file || img.url)) ||
              "At least one image is required",
          }}
          render={({ field, fieldState }) => (
            <>
              <MultiImageField {...field} label="Variant Images" />
              {fieldState?.error && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      {/* Price + Stock */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="description-text text-xs">Price</Label>
          <Controller
            name={`variants.${index}.price`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
            )}
          />
        </div>
        <div className="space-y-1">
          <Label className="description-text text-xs">Stock</Label>
          <Controller
            name={`variants.${index}.stocks.0.quantity`}
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                placeholder="0"
                value={field.value}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                disabled={!!stock?.id}
              />
            )}
          />
        </div>
      </div>

      {/* Attributes — uses DynamicVariantTabs driven by attributeDefinitions */}
      <div className="space-y-1">
        <Label className="description-text text-xs">Attributes</Label>
        {attributeDefinitions.length > 0 ? (
          <Controller
            name={`variants.${index}.attributes`}
            control={control}
            render={({ field }) => (
              <DynamicVariantTabs
                attributeDefinitions={attributeDefinitions}
                value={field.value}
                onChange={field.onChange}
              />
            )}
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
          <Controller
            name={`variants.${index}.cogsData`}
            control={control}
            render={({ field }) => (
              <DynamicVariantTabs
                attributeDefinitions={cogsDefinitions}
                value={field.value}
                onChange={field.onChange}
              />
            )}
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
