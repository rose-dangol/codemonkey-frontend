import { useMemo, useEffect, useRef, memo, useCallback } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// ─── Types ────────────────────────────────────────────────────────────────────

type AttributeDefinition = {
  id: string;
  name: string;
};

type AttributeValue = {
  value: string;
  disabled: boolean;
};

export type AttributePayloadItem = {
  attributeId: string;
  value: string;
};

type FormValues = {
  attributes: Record<string, AttributeValue[]>;
};

export type DynamicTabsProps = {
  attributeDefinitions: AttributeDefinition[];
  value?: Record<string, AttributeValue[]>;
  onChange?: (data: AttributePayloadItem[]) => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Resolves a single attribute's initial value from any supported input shape. */
function resolveInitialEntry(
  attr: AttributeDefinition,
  value: DynamicTabsProps["value"],
): AttributeValue {
  if (!value) return { value: "", disabled: true };

  if (Array.isArray(value)) {
    const item = (value as any[]).find((v) => v.attributeId === attr.id);
    if (item) return { value: item.value ?? "", disabled: false };
    return { value: "", disabled: true };
  }

  const raw = (value as any)[attr.name] ?? (value as any)[attr.id];

  if (Array.isArray(raw) && raw.length > 0) {
    return { value: raw[0].value ?? "", disabled: raw[0].disabled ?? false };
  }
  if (typeof raw === "string") return { value: raw, disabled: false };
  if (raw && typeof raw === "object" && "value" in raw) {
    return { value: raw.value ?? "", disabled: raw.disabled ?? false };
  }

  return { value: "", disabled: false };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type TabTriggerProps = {
  attribute: AttributeDefinition;
  control: any;
};

/** Isolated trigger so only this badge re-renders on disabled-state change. */
const AttributeTabTrigger = memo(({ attribute, control }: TabTriggerProps) => {
  const disabled = useWatch({
    control,
    name: `attributes.${attribute.name}.0.disabled` as const,
  });

  return (
    <TabsTrigger
      value={attribute.name}
      className="
        group relative overflow-hidden
        rounded-xl border border-transparent
        px-4 py-2.5 text-sm font-medium
        transition-all duration-200
        data-[state=active]:bg-primary
        data-[state=active]:text-primary-foreground
        data-[state=active]:shadow-md
        hover:bg-muted/70 hover:border-border
      "
    >
      <div className="flex items-center gap-2">
        <span>{attribute.name}</span>
        <Badge
          className={`
            rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors
            group-data-[state=active]:bg-white/20
            group-data-[state=active]:text-white
            ${disabled ? "text-red-600" : "action-text"}
          `}
        >
          {disabled ? "Missing" : "Ready"}
        </Badge>
      </div>
    </TabsTrigger>
  );
});
AttributeTabTrigger.displayName = "AttributeTabTrigger";

type AttributeTableProps = {
  attributeName: string;
  control: any;
  register: any;
};

const AttributeTable = memo(
  ({ attributeName, control, register }: AttributeTableProps) => (
    <Card className="mt-2 border-muted shadow-sm bg-primary py-0">
      <CardContent className="p-4 py-[2.5rem] space-y-4">
        <h2 className="description-text font-semibold">{attributeName}</h2>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
          <Input
            placeholder={`Enter ${attributeName}`}
            {...register(`attributes.${attributeName}.0.value`)}
            className="w-full description-text"
          />

          <div className="flex items-center gap-3 min-w-fit">
            <Controller
              control={control}
              name={`attributes.${attributeName}.0.disabled`}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <label className="text-sm text-muted-foreground cursor-pointer">
              Mark as unavailable
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
);
AttributeTable.displayName = "AttributeTable";

// ─── Main component ───────────────────────────────────────────────────────────

export default function DynamicVariantTabs({
  attributeDefinitions,
  value,
  onChange,
}: DynamicTabsProps) {
  // Stable refs — prevent subscription teardown on every render
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const defsRef = useRef(attributeDefinitions);
  defsRef.current = attributeDefinitions;

  const defaultValues = useMemo<FormValues>(
    () => ({
      attributes: Object.fromEntries(
        attributeDefinitions.map((attr) => [
          attr.name,
          [resolveInitialEntry(attr, value)],
        ]),
      ),
    }),
    [attributeDefinitions, value],
  );

  const { control, register, watch } = useForm<FormValues>({ defaultValues });

  useEffect(() => {
    const subscription = watch((formValues) => {
      if (!onChangeRef.current || !formValues.attributes) return;

      const payload: AttributePayloadItem[] = [];
      const attrs = formValues.attributes as Record<string, AttributeValue[]>;

      for (const [name, entries] of Object.entries(attrs)) {
        const def = defsRef.current.find((d) => d.name === name);
        if (!def) continue;
        for (const entry of entries) {
          if (entry?.value?.trim() && !entry.disabled) {
            payload.push({ attributeId: def.id, value: entry.value });
          }
        }
      }

      onChangeRef.current(payload);
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  if (!attributeDefinitions.length) {
    return (
      <p className="text-sm text-muted-foreground">No attributes available.</p>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={attributeDefinitions[0].name} className="w-full">
        {/* Tab list */}
        <div className="rounded-2xl border border-border/60 state-color backdrop-blur-sm shadow-sm p-2">
          <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-transparent p-0 h-auto">
            {attributeDefinitions.map((attribute) => (
              <AttributeTabTrigger
                key={attribute.id}
                attribute={attribute}
                control={control}
              />
            ))}
          </TabsList>
        </div>

        {/* Tab panels */}
        {attributeDefinitions.map((attribute) => (
          <TabsContent
            key={attribute.id}
            value={attribute.name}
            className="
              mt-5 rounded-2xl border border-border/60
              bg-secondary shadow-sm animate-in fade-in-50
            "
          >
            <div className="border-b border-border/50 px-6 py-4">
              <h3 className="text-lg heading-font tracking-tight">
                {attribute.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Configure and manage all related attribute values.
              </p>
            </div>

            <div className="p-6">
              <AttributeTable
                attributeName={attribute.name}
                control={control}
                register={register}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
