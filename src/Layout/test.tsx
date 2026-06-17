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
import { useEffect, useRef, useState } from "react";
import {
  useForm,
  Controller,
  type SubmitHandler,
  type FieldValues,
  type DefaultValues,
  type ControllerRenderProps,
  type ArrayPath,
  useFieldArray,
} from "react-hook-form";
import type { UpdateModalProps } from "@/TypeDefinitions/ModalType";

import { TreeDropdown } from "@/components/TreeDropdown";
import DynamicVariantTabs from "@/components/DynamicTabs";
import { GeneralPageDropdown } from "@/components/GeneralPageDropdown";
import { MultiSelectField } from "@/components/MultiSelectField";
import ToggleSwitch from "@/components/ToggleSwitch";
import { VariantTab } from "@/components/VariantTab";
import { cn } from "@/lib/utils";

// ─── Field renderer helpers ────────────────────────────────────────────────────

interface FieldRenderProps {
  field: any;
  controller: ControllerRenderProps<any, any>;
  formValues: FieldValues;
}

const renderSelect = ({ field, controller }: FieldRenderProps) => (
  <TreeDropdown
    options={field.options}
    value={controller.value ?? ""}
    onChange={controller.onChange}
  />
);

const renderBoolean = ({ field, controller }: FieldRenderProps) => (
  <label className="inline-flex items-center cursor-pointer gap-3">
    <input
      id={field.key}
      type="checkbox"
      checked={!!controller.value}
      onChange={(e) => controller.onChange(e.target.checked)}
      className="sr-only peer"
    />
    <div
      className="
        w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500
        transition-colors relative
        after:content-[''] after:absolute after:top-0.5 after:left-0.5
        after:bg-white after:border after:border-gray-300 after:rounded-full
        after:h-5 after:w-5 after:transition-transform
        peer-checked:after:translate-x-5
      "
    />
  </label>
);

const renderSelectParent = ({ field, controller }: FieldRenderProps) => (
  <TreeDropdown
    options={field.options}
    value={controller.value ?? ""}
    onChange={controller.onChange}
    allowParentSelect
  />
);

const renderSelectGeneralPage = ({ field, controller }: FieldRenderProps) => (
  <GeneralPageDropdown
    options={field.options}
    value={controller.value ?? ""}
    onChange={controller.onChange}
  />
);

const renderToggleSwitch = ({ field, controller }: FieldRenderProps) => (
  <ToggleSwitch
    checked={controller.value ?? false}
    label={field.label}
    onChange={controller.onChange}
  />
);

const renderTabs = ({ field, controller }: FieldRenderProps) => {
  const definitions =
    field.tabDefinitions ??
    field.options?.map((opt: any) => ({ id: opt.value, name: opt.label })) ??
    [];
  return (
    <DynamicVariantTabs
      attributeDefinitions={definitions}
      value={controller.value}
      onChange={controller.onChange}
    />
  );
};

const renderMultiSelect = (
  { field, controller }: FieldRenderProps,
  onPendingCreate: (
    key: string,
    payload: { name: string; slug: string },
  ) => void,
) => (
  <MultiSelectField
    field={field}
    value={controller.value}
    onChange={(_key: string, val: any) => controller.onChange(val)}
    onPendingCreate={onPendingCreate}
  />
);

const renderNumber = ({ field, controller }: FieldRenderProps) => (
  <Input
    id={field.key}
    type="number"
    placeholder={field.placeholder ?? `Enter ${field.label}`}
    value={controller.value ?? ""}
    onChange={(e) =>
      controller.onChange(e.target.value === "" ? "" : Number(e.target.value))
    }
    className="description-text"
  />
);

const renderTextInput = ({ field, controller }: FieldRenderProps) => (
  <Input
    id={field.key}
    type={field.type ?? "text"}
    placeholder={field.placeholder ?? `Enter ${field.label}`}
    value={controller.value ?? ""}
    onChange={(e) => controller.onChange(e.target.value)}
    className="description-text"
  />
);

const renderDropdown = ({ field, controller }: FieldRenderProps) => (
  <select
    id={field.key}
    value={controller.value ?? ""}
    onChange={(e) => controller.onChange(e.target.value)}
    className="description-text border p-2 rounded w-full"
  >
    <option value="">None</option>
    {field.options?.map((opt: any) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

const renderImage = ({ field, controller }: FieldRenderProps) => {
  const previewUrl =
    controller.value instanceof File
      ? URL.createObjectURL(controller.value)
      : typeof controller.value === "string"
        ? controller.value
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
            if (file) controller.onChange(file);
          }}
        />
      </label>
    </div>
  );
};

const renderRadioButton = ({ field, controller }: FieldRenderProps) => (
  <div className="flex gap-4">
    {field.options?.map((opt: any) => (
      <label
        key={String(opt.value)}
        className="flex items-center gap-2 cursor-pointer"
      >
        <input
          type="radio"
          name={field.key}
          checked={controller.value === opt.value}
          onChange={() => controller.onChange(opt.value)}
        />
        {opt.label}
      </label>
    ))}
  </div>
);

const renderSelectDependent = ({
  field,
  controller,
  formValues,
}: FieldRenderProps) => {
  const parentValue = formValues[field.parentKey];
  const options = field.getOptions
    ? field.getOptions(parentValue, field.sourceData)
    : [];
  return (
    <TreeDropdown
      options={options}
      value={controller.value ?? ""}
      onChange={controller.onChange}
    />
  );
};

// ─── Field type → renderer map ─────────────────────────────────────────────────

type FieldType =
  | "select"
  | "boolean"
  | "select(parent)"
  | "select(GeneralPage)"
  | "toggleSwitch"
  | "tabs"
  | "multi-select"
  | "number"
  | "dropdown"
  | "image"
  | "radio-button"
  | "select(dependent)"
  | "default";

type RendererFn = (
  props: FieldRenderProps,
  onPendingCreate: (
    key: string,
    payload: { name: string; slug: string },
  ) => void,
) => React.ReactNode;

const FIELD_RENDERERS: Record<FieldType, RendererFn> = {
  select: (p) => renderSelect(p),
  boolean: (p) => renderBoolean(p),
  "select(parent)": (p) => renderSelectParent(p),
  "select(GeneralPage)": (p) => renderSelectGeneralPage(p),
  toggleSwitch: (p) => renderToggleSwitch(p),
  tabs: (p) => renderTabs(p),
  "multi-select": (p, cb) => renderMultiSelect(p, cb),
  number: (p) => renderNumber(p),
  dropdown: (p) => renderDropdown(p),
  image: (p) => renderImage(p),
  "radio-button": (p) => renderRadioButton(p),
  "select(dependent)": (p) => renderSelectDependent(p),
  default: (p) => renderTextInput(p),
};

// ─── Keys hidden while variant mode is active ──────────────────────────────────
const SKIP_IN_VARIANT_MODE = new Set(["price", "cogs"]);

// ─── Default blank variant shape ───────────────────────────────────────────────
const BLANK_VARIANT = {
  sku: "",
  price: 0,
  stock: 0,
  images: [] as any[],
  attributes: [] as any[],
  cogsData: {} as Record<string, any>,
};

// ─── Variant tab bar ───────────────────────────────────────────────────────────

interface VariantTabBarProps {
  variantFields: { id: string }[];
  activeIndex: number;
  getLabel: (index: number) => string;
  onActivate: (index: number) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
}

function VariantTabBar({
  variantFields,
  activeIndex,
  getLabel,
  onActivate,
  onRemove,
  onAdd,
}: VariantTabBarProps) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-border/60 pb-0">
      {variantFields.map((vf, index) => (
        <button
          key={vf.id}
          type="button"
          onClick={() => onActivate(index)}
          className={cn(
            "relative -mb-px inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-t-md border border-b-0 transition-colors",
            activeIndex === index
              ? "bg-background border-border text-foreground font-medium z-10"
              : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {getLabel(index)}
          {variantFields.length > 1 && (
            <span
              role="button"
              aria-label={`Remove ${getLabel(index)}`}
              className="ml-0.5 opacity-40 hover:opacity-100 transition-opacity text-[10px] leading-none"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
            >
              ✕
            </span>
          )}
        </button>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className={cn(
          "relative -mb-px inline-flex items-center gap-1 px-3 py-1.5 text-xs",
          "rounded-t-md border border-dashed border-border/60 border-b-0",
          "text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
        )}
      >
        + Add Variant
      </button>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function UpdateModal<T extends Record<string, any>>(
  props: UpdateModalProps<T>,
) {
  const pendingCreatesRef = useRef<
    Record<string, Array<{ name: string; slug: string }>>
  >({});

  // Active tab index for the variant tab UI
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);

  const buildDefaultValues = (): DefaultValues<T> => {
    const tabDefaults = Object.fromEntries(
      props.fields.filter((f) => f.type === "tabs").map((f) => [f.key, []]),
    );
    return { ...tabDefaults, ...props.initialData } as DefaultValues<T>;
  };

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<T>({
    defaultValues: buildDefaultValues(),
  });

  const {
    fields: variantFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "variants" as ArrayPath<T>,
  });

  // ── Sync form when modal opens ──────────────────────────────────────────
  useEffect(() => {
    if (props.open) {
      reset(buildDefaultValues());
      pendingCreatesRef.current = {};
      setActiveVariantIndex(0);
    }
  }, [props.open]);

  // ── Reset active tab when variant mode is turned off ────────────────────
  useEffect(() => {
    if (!props.variantMode) setActiveVariantIndex(0);
  }, [props.variantMode]);

  // ── Watch entire form for dependent fields and tab labels ───────────────
  const formValues = watch();

  // Derive a human-readable label for each variant tab
  const getVariantLabel = (index: number): string => {
    const name =
      formValues?.variants?.[index]?.name || formValues?.variants?.[index]?.sku;
    return name ? String(name) : `Variant ${index + 1}`;
  };

  // ── Notify parent when variant-toggle changes ───────────────────────────
  const variantToggleField = props.fields.find(
    (f) =>
      f.type === "toggleSwitch" &&
      (f.key === "multiVariantFlag" || f.label === "Have Multiple Product?"),
  );

  useEffect(() => {
    if (!variantToggleField) return;
    const subscription = watch((values, { name }) => {
      if (name === String(variantToggleField.key)) {
        props.onVariantModeChange?.(!!values[variantToggleField.key]);
      }
    });
    return () => subscription.unsubscribe();
  }, [variantToggleField?.key, props.onVariantModeChange]);

  // ── Pending multi-select creates ────────────────────────────────────────
  const handlePendingCreate = (
    fieldKey: string,
    payload: { name: string; slug: string },
  ) => {
    pendingCreatesRef.current[fieldKey] = [
      ...(pendingCreatesRef.current[fieldKey] ?? []),
      payload,
    ];
  };

  // ── Variant tab management ──────────────────────────────────────────────
  const handleAddVariant = () => {
    append(BLANK_VARIANT as any);
    setActiveVariantIndex(variantFields.length); // length before append = new last index
  };

  const handleRemoveVariant = (index: number) => {
    remove(index);
    setActiveVariantIndex((prev) =>
      prev >= index && prev > 0
        ? prev - 1
        : Math.min(prev, variantFields.length - 2),
    );
  };

  // ── Submit handler ──────────────────────────────────────────────────────
  const onSubmit: SubmitHandler<T> = async (rawData) => {
    const finalData = { ...rawData } as Record<string, any>;

    // Resolve pending multi-select creates
    await Promise.all(
      props.fields
        .filter((field) => {
          const pending = pendingCreatesRef.current[field.key];
          return field.onCreate && pending?.length;
        })
        .map(async (field) => {
          const pending = pendingCreatesRef.current[field.key];
          const createdOptions = await Promise.all(
            pending.map(async (payload) => {
              try {
                const created = await field.onCreate!(payload);
                return { slug: payload.slug, id: created?.id };
              } catch (err) {
                console.error(
                  `Failed to create item for field "${field.key}"`,
                  payload,
                  err,
                );
                return { slug: payload.slug, id: null };
              }
            }),
          );

          const current = finalData[field.key];
          if (Array.isArray(current)) {
            finalData[field.key] = current.map((val) => {
              if (typeof val === "string" && val.startsWith("__new__")) {
                const slug = val.replace("__new__", "");
                return createdOptions.find((c) => c.slug === slug)?.id ?? val;
              }
              return val;
            });
          }
        }),
    );

    // Strip unresolved __new__ placeholders from multi-select fields
    props.fields
      .filter((f) => f.type === "multi-select")
      .forEach((f) => {
        const val = finalData[f.key];
        if (Array.isArray(val)) {
          finalData[f.key] = val.filter(
            (v: any) => typeof v !== "string" || !v.startsWith("__new__"),
          );
        }
      });

    pendingCreatesRef.current = {};
    console.log("data recieved inside of UpdateModal", finalData);

    // Variant mode — delegate to parent callbacks
    if (props.variantMode) {
      if (props.initialData && props.onUpdateWithVariants) {
        props.onUpdateWithVariants(
          finalData as Partial<T>,
          finalData.variants ?? [],
        );
      } else {
        props.onAddWithVariants?.(
          finalData as Partial<T>,
          finalData.variants ?? [],
        );
      }
      props.setOpen(false);
      return;
    }

    props.onUpdate?.(finalData as Partial<T>);
    props.setOpen(false);
  };

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
            if (variantMode && SKIP_IN_VARIANT_MODE.has(field.key)) return null;

            const renderer =
              FIELD_RENDERERS[(field.type as FieldType) ?? "default"] ??
              FIELD_RENDERERS.default;

            return (
              <div key={field.key} className="space-y-1">
                {field.type !== "toggleSwitch" && (
                  <Label htmlFor={field.key} className="description-text">
                    {field.label}
                  </Label>
                )}

                <Controller
                  name={field.key as any}
                  control={control}
                  render={({ field: rhfField }) =>
                    renderer(
                      {
                        field,
                        controller: rhfField,
                        formValues,
                      },
                      handlePendingCreate,
                    ) as React.ReactElement
                  }
                />
              </div>
            );
          })}

          {variantMode && (
            <div className="space-y-0 pt-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-border/60" />
                <span className="text-xs font-bold uppercase px-2">
                  Product Variants
                </span>
                <div className="h-px flex-1 bg-border/60" />
              </div>

              {/* Tab bar */}
              <VariantTabBar
                variantFields={variantFields}
                activeIndex={activeVariantIndex}
                getLabel={getVariantLabel}
                onActivate={setActiveVariantIndex}
                onRemove={handleRemoveVariant}
                onAdd={handleAddVariant}
              />

              {/* Active variant panel */}
              {variantFields[activeVariantIndex] && (
                <div className="border border-border rounded-b-md rounded-tr-md p-4">
                  <VariantTab
                    key={variantFields[activeVariantIndex].id}
                    index={activeVariantIndex}
                    control={control}
                    remove={remove}
                    attributeDefinitions={props.attributeDefinitions ?? []}
                    cogsDefinitions={props.cogsDefinitions ?? []}
                    isOnly={variantFields.length === 1}
                  />
                </div>
              )}

              {/* Empty state when no variants exist yet */}
              {variantFields.length === 0 && (
                <div className="border border-dashed border-border/60 rounded-md p-6 text-center text-sm text-muted-foreground">
                  No variants yet. Click &ldquo;+ Add Variant&rdquo; above to
                  get started.
                </div>
              )}
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
            onClick={handleSubmit(onSubmit)}
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
