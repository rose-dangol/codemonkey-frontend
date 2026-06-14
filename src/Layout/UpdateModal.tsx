import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@radix-ui/react-dialog";
import { useState, useEffect, useRef } from "react";
import type { UpdateModalProps } from "@/TypeDefinitions/ModalType";

import { TreeDropdown } from "@/components/TreeDropdown";
import DynamicVariantTabs from "@/components/DynamicTabs";
import { GeneralPageDropdown } from "@/components/GeneralPageDropdown";
import { MultiSelectField } from "@/components/MultiSelectField";
import ToggleSwitch from "@/components/ToggleSwitch";
import { VariantEditorSection } from "@/components/VariantEditorSection";

export function UpdateModal<T extends Record<string, any>>(
  props: UpdateModalProps<T>,
) {
  const [formData, setFormData] = useState<Partial<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pendingCreatesRef = useRef<
    Record<string, Array<{ name: string; slug: string }>>
  >({});

  // ── Reset on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (props.open) {
      const tabDefaults = Object.fromEntries(
        props.fields.filter((f) => f.type === "tabs").map((f) => [f.key, []]),
      ) as Partial<T>;

      setFormData({
        ...tabDefaults,
        ...props.initialData,
      });
      pendingCreatesRef.current = {};
      setIsSubmitting(false);
    }
  }, [props.open]);

  // ── Form change handler ───────────────────────────────────────────────────
  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    const variantToggleField = props.fields.find(
      (f) =>
        f.type === "toggleSwitch" &&
        (f.key === "multiVariantFlag" || f.label === "Have Multiple Product?"),
    );
    if (variantToggleField && key === variantToggleField.key) {
      props.onVariantModeChange?.(!!value);
    }
  };

  const handlePendingCreate = (
    fieldKey: string,
    payload: { name: string; slug: string },
  ) => {
    pendingCreatesRef.current[fieldKey] = [
      ...(pendingCreatesRef.current[fieldKey] ?? []),
      payload,
    ];
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalFormData = { ...formData } as Record<string, any>;

      // Resolve pending multi-select creates
      const createPromises: Promise<void>[] = [];
      props.fields.forEach((field) => {
        const pending = pendingCreatesRef.current[field.key];
        if (field.onCreate && pending?.length) {
          const promise = (async () => {
            const createdOptions = await Promise.all(
              pending.map(async (payload) => {
                try {
                  const createdItem = await field.onCreate!(payload);
                  return { slug: payload.slug, id: createdItem?.id };
                } catch (err) {
                  console.error(
                    `Failed to create item for field ${field.key}`,
                    payload,
                    err,
                  );
                  return { slug: payload.slug, id: null };
                }
              }),
            );

            const currentValues = finalFormData[field.key];
            if (Array.isArray(currentValues)) {
              finalFormData[field.key] = currentValues.map((val) => {
                if (typeof val === "string" && val.startsWith("__new__")) {
                  const slug = val.replace("__new__", "");
                  const match = createdOptions.find((co) => co.slug === slug);
                  return match?.id || val;
                }
                return val;
              });
            }
          })();
          createPromises.push(promise);
        }
      });

      await Promise.all(createPromises);

      props.fields
        .filter((f) => f.type === "multi-select")
        .forEach((f) => {
          const val = finalFormData[f.key];
          if (Array.isArray(val)) {
            finalFormData[f.key] = val.filter(
              (v: any) => typeof v !== "string" || !v.startsWith("__new__"),
            );
          }
        });

      pendingCreatesRef.current = {};

      // Variant mode — delegate to parent's callbacks
      if (props.variantMode) {
        if (props.initialData && props.onUpdateWithVariants) {
          props.onUpdateWithVariants(
            finalFormData as Partial<T>,
            props.variants ?? [],
          );
          props.setOpen(false);
          return;
        } else if (props.onAddWithVariants) {
          props.onAddWithVariants(
            finalFormData as Partial<T>,
            props.variants ?? [],
          );
          props.setOpen(false);
          return;
        }
      }

      // Default flow
      props.onUpdate?.(finalFormData as Partial<T>);
      props.setOpen(false);
    } catch (err) {
      console.error("Error submitting form", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Field renderers ───────────────────────────────────────────────────────
  const fieldRenderers: Record<string, (field: any) => React.ReactNode> = {
    select: (field) => (
      <TreeDropdown
        options={field.options}
        value={formData[field.key] ?? ""}
        onChange={(val) => handleChange(field.key, val)}
      />
    ),
    boolean: (field) => (
      <label className="inline-flex items-center cursor-pointer gap-3">
        <input
          id={field.key}
          type="checkbox"
          checked={!!formData[field.key]}
          onChange={(e) => handleChange(field.key, e.target.checked)}
          className="sr-only peer"
        />
        <div
          className="w-11 h-6
                     bg-gray-300
                     rounded-full
                     peer-checked:bg-green-500
                     transition-colors
                     relative
                     after:content-['']
                     after:absolute
                     after:top-0.5
                     after:left-0.5
                     after:bg-white
                     after:border
                     after:border-gray-300
                     after:rounded-full
                     after:h-5
                     after:w-5
                     after:transition-transform
                     peer-checked:after:translate-x-5"
        />
      </label>
    ),
    "select(parent)": (field) => (
      <TreeDropdown
        options={field.options}
        value={formData[field.key] ?? ""}
        onChange={(val) => handleChange(field.key, val)}
        allowParentSelect
      />
    ),
    "select(GeneralPage)": (field) => (
      <GeneralPageDropdown
        options={field.options}
        value={formData[field.key] ?? ""}
        onChange={(val) => handleChange(field.key, val)}
      />
    ),
    toggleSwitch: (field) => (
      <ToggleSwitch
        checked={formData[field.key] ?? false}
        label={field.label}
        onChange={(val) => handleChange(field.key, val)}
      />
    ),
    tabs: (field) => {
      const definitions =
        field.tabDefinitions ??
        field.options?.map((opt: any) => ({
          id: opt.value,
          name: opt.label,
        })) ??
        [];
      return (
        <DynamicVariantTabs
          attributeDefinitions={definitions}
          value={formData[field.key] as any}
          onChange={(data) => handleChange(field.key, data as any)}
        />
      );
    },
    "multi-select": (field) => (
      <MultiSelectField
        field={field}
        value={formData[field.key]}
        onChange={handleChange}
        onPendingCreate={handlePendingCreate}
      />
    ),
    number: (field) => (
      <Input
        id={field.key}
        type="number"
        placeholder={field.placeholder ?? `Enter ${field.label}`}
        value={formData[field.key] ?? ""}
        onChange={(e) =>
          handleChange(
            field.key,
            e.target.value === "" ? "" : Number(e.target.value),
          )
        }
        className="description-text"
      />
    ),
    default: (field) => (
      <Input
        id={field.key}
        type={field.type ?? "text"}
        placeholder={field.placeholder ?? `Enter ${field.label}`}
        value={formData[field.key] ?? ""}
        onChange={(e) => handleChange(field.key, e.target.value)}
        className="description-text"
      />
    ),
    dropdown: (field) => (
      <select
        id={field.key}
        value={formData[field.key] ?? ""}
        onChange={(e) => handleChange(field.key, e.target.value)}
        className="description-text border p-2 rounded w-full"
      >
        <option value="">None</option>
        {field.options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ),
    image: (field) => {
      const currentValue = formData[field.key];
      const previewUrl =
        (currentValue as any) instanceof File
          ? URL.createObjectURL(currentValue as any)
          : typeof currentValue === "string"
            ? currentValue
            : null;

      return (
        <div className="flex items-center gap-3">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="h-12 w-12 rounded-lg object-cover border border-slate-700"
            />
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="description-text">🔗 Choose File</span>
            <input
              id={field.key}
              type="file"
              className="hidden"
              name="image"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleChange(field.key, file);
              }}
            />
          </label>
        </div>
      );
    },
    "radio-button": (field) => (
      <div className="flex gap-4">
        {field.options?.map((opt: any) => (
          <label
            key={String(opt.value)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name={field.key}
              checked={formData[field.key] === opt.value}
              onChange={() =>
                setFormData((prev) => ({ ...prev, [field.key]: opt.value }))
              }
            />
            {opt.label}
          </label>
        ))}
      </div>
    ),
    "select(dependent)": (field) => {
      const parentValue = formData[field.parentKey];
      const options = field.getOptions
        ? field.getOptions(parentValue, field.sourceData)
        : [];
      return (
        <TreeDropdown
          options={options}
          value={formData[field.key] ?? ""}
          onChange={(val) => handleChange(field.key, val)}
        />
      );
    },
  };

  // Keys suppressed in variant mode (price rendered per-variant instead)
  const skipInVariantMode = new Set(["price","cogs","quantity"]);
  const variantMode = props.variantMode ?? false;

  return (
    <Dialog open={props.open} onOpenChange={props.setOpen}>
      <DialogContent className="bg-primary border-0 max-h-[calc(100vh-10rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="heading-font">
            {props.title ?? "Update details"}
          </DialogTitle>
          <DialogDescription className="description-text">
            {props.description ?? "Edit the fields below and confirm to save."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {props.fields.map((field) => {
            // Hide standalone price field when variant mode is active
            if (variantMode && skipInVariantMode.has(field.key)) return null;

            const renderField =
              fieldRenderers[field.type ?? "default"] ?? fieldRenderers.default;

            return (
              <div key={field.key} className="space-y-1">
                {/* ToggleSwitch renders its own label */}
                {field.type !== "toggleSwitch" && (
                  <Label htmlFor={field.key} className="description-text">
                    {field.label}
                  </Label>
                )}
                {renderField(field)}
              </div>
            );
          })}

          {variantMode && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border/60" />
                <span className="text-xs font-bold description-text uppercase tracking-wider px-2">
                  Product Variants
                </span>
                <div className="h-px flex-1 bg-border/60" />
              </div>

              <VariantEditorSection
                variants={props.variants ?? []}
                attributeDefinitions={props.attributeDefinitions ?? []}
                cogsDefinitions={props.cogsDefinitions ?? []}
                onAdd={props.onAddVariant ?? (() => {})}
                onRemove={props.onRemoveVariant ?? (() => {})}
                onChange={props.onUpdateVariantField ?? (() => {})}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            className="bg-black"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : props.initialData ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
