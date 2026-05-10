import { useMemo, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Input } from "@/components/ui/input";

import { Checkbox } from "@/components/ui/checkbox";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

import { Card, CardContent } from "@/components/ui/card";

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

export default function DynamicVariantTabs({
  attributeDefinitions,
  value,
  onChange,
}: DynamicTabsProps) {
  const defaultValues = useMemo<FormValues>(() => {
    const attributes: Record<string, AttributeValue[]> = {};

    attributeDefinitions.forEach((attr) => {
      let attrValue = "";
      let attrDisabled = false;

      if (value) {
        if (Array.isArray(value)) {
          // If value is already in payload format AttributePayloadItem[]
          const item = value.find((v: any) => v.attributeId === attr.id);
          if (item) {
            attrValue = item.value;
          }
        } else {
          // If value is a Record from mapVariantToForm
          const val = (value as any)[attr.name] ?? (value as any)[attr.id];
          if (Array.isArray(val) && val.length > 0) {
            attrValue = val[0].value || "";
            attrDisabled = val[0].disabled || false;
          } else if (typeof val === "string") {
            attrValue = val;
          } else if (typeof val === "object" && val !== null && "value" in val) {
            attrValue = val.value || "";
            attrDisabled = val.disabled || false;
          }
        }
      }

      attributes[attr.name] = [
        {
          value: attrValue,
          disabled: attrDisabled,
        },
      ];
    });

    return { attributes };
  }, [attributeDefinitions, value]);

  const { control, register, watch } = useForm<FormValues>({
    defaultValues,
  });

  // Keep onChange in a ref so subscription never re-triggers
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const watchedAttributes = watch("attributes");

  // Subscribe to form changes via watch's callback – fires only on actual value changes
  useEffect(() => {
    const subscription = watch((formValues) => {
      if (onChangeRef.current && formValues.attributes) {
        const attrs = formValues.attributes as Record<string, AttributeValue[]>;
        const payload: AttributePayloadItem[] = [];

        for (const [name, entries] of Object.entries(attrs)) {
          const def = attributeDefinitions.find((d) => d.name === name);
          if (!def) continue;
          for (const entry of entries) {
            if (entry.value.trim() !== "" && !entry.disabled) {
              payload.push({
                attributeId: def.id,
                value: entry.value,
              });
            }
          }
        }

        onChangeRef.current(payload);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, attributeDefinitions]);

  /* ------------------------------------------------------------------------ */
  /*                             TAB COMPLETION                               */
  /* ------------------------------------------------------------------------ */

  const isTabDisabled = (attributeName: string) => {
    const values = watchedAttributes?.[attributeName];
    return Array.isArray(values) ? values.some((item) => item.disabled) : false;
  };

  if (!attributeDefinitions || attributeDefinitions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No attributes available.</p>
    );
  }

  console.log("watchedAttributes", watchedAttributes);

  return (
    <div className="space-y-4">
      <Tabs defaultValue={attributeDefinitions[0].name}>
        {/* ------------------------------------------------------------------ */}
        {/*                              TAB LIST                              */}
        {/* ------------------------------------------------------------------ */}

        <TabsList className="flex flex-wrap h-auto">
          {attributeDefinitions.map((attribute) => {
            const disabled = isTabDisabled(attribute.name);

            return (
              <TabsTrigger
                key={attribute.id}
                value={attribute.name}
                className="gap-2"
              >
                <Badge variant={disabled ? "destructive" : "default"}>
                  {attribute.name}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {attributeDefinitions.map((attribute) => (
          <TabsContent key={attribute.id} value={attribute.name}>
            <AttributeTable
              attributeName={attribute.name}
              control={control}
              register={register}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

type AttributeTableProps = {
  attributeName: string;
  control: any;
  register: any;
};

function AttributeTable({
  attributeName,
  control,
  register,
}: AttributeTableProps) {
  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4">{attributeName}</h2>

        <Table>
          <TableBody>
            <TableRow>
              {/* VALUE INPUT */}
              <TableCell className="w-[70%]">
                <Input
                  placeholder={`Enter ${attributeName}`}
                  {...register(`attributes.${attributeName}.0.value`)}
                />
              </TableCell>

              {/* CHECKBOX */}
              <TableCell>
                <div className="flex items-center gap-2">
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

                  <span className="text-sm">Do not have this attribute</span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
