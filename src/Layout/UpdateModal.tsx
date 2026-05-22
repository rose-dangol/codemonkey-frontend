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
import { useState, useEffect } from "react";
import type { UpdateModalProps } from "@/TypeDefinitions/ModalType";
import Select from "react-select";
import { TreeDropdown } from "@/components/TreeDropdown";
import DynamicVariantTabs from "@/components/DynamicTabs";

export function UpdateModal<T extends Record<string, any>>(
  props: UpdateModalProps<T>,
) {
  const [formData, setFormData] = useState<Partial<T>>({});
  useEffect(() => {
    if (props.open) {
      const tabDefaults = Object.fromEntries(
        props.fields.filter((f) => f.type === "tabs").map((f) => [f.key, []]),
      ) as Partial<T>;

      setFormData({
        ...tabDefaults,
        ...props.initialData,
      });
    }
  }, [props.open, props.initialData, props.fields]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    props.onUpdate?.(formData);
    props.setOpen(false);
  };

  const fieldRenderers: Record<string, (field: any) => React.ReactNode> = {
    select: (field) => (
      <TreeDropdown
        options={field.options}
        value={formData[field.key] ?? ""}
        onChange={(val) => handleChange(field.key, val)}
      />
    ),
    "select(parent)": (field) => (
      <TreeDropdown
        options={field.options}
        value={formData[field.key] ?? ""}
        onChange={(val) => handleChange(field.key, val)}
        allowParentSelect
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
      <Select
        isMulti
        name={field.key}
        options={field.options}
        defaultValue={field.options?.filter((opt: any) => opt.isHidden)}
        className="description-text bg-white"
        onChange={(selected: any) => {
          handleChange(
            field.key,
            selected.map((item: any) => item.value),
          );
        }}
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
        currentValue instanceof File
          ? URL.createObjectURL(currentValue)
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
  };

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
            const renderField =
              fieldRenderers[field.type ?? "default"] ?? fieldRenderers.default;
            return (
              <div key={field.key} className="space-y-1">
                <Label htmlFor={field.key} className="description-text">
                  {field.label}
                </Label>

                {renderField(field)}
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild className="bg-black">
            <Button onClick={handleSubmit}>
              {props.initialData ? "Update" : "Add"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
