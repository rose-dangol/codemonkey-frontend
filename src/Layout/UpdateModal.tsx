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
      setFormData(props.initialData ?? {});
    }
  }, [props.open, props.initialData]);
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

    tabs: (field) => (
      <DynamicVariantTabs
        attributeDefinitions={field.tabDefinitions ?? []}
        value={formData[field.key] as any}
        onChange={(data) => handleChange(field.key, data as any)}
      />
    ),

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
  };

  return (
    <Dialog open={props.open} onOpenChange={props.setOpen}>
      <DialogContent className="bg-primary border-0">
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
            <Button onClick={handleSubmit}>Update</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
