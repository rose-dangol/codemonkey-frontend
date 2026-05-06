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
import type {
  UpdateCategoryDto,
  UpdateModalProps,
} from "@/TypeDefinitions/ModalType";
import Select from "react-select";

export function UpdateModal(props: UpdateModalProps<UpdateCategoryDto>) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  console.log("called", props.fields);

  useEffect(() => {
    if (props.open) {
      setFormData(props.initialData ?? {});
    }
  }, [props.open, props.initialData]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    props.onUpdate?.(formData);
    props.setOpen(false);
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
          {props.fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <Label htmlFor={field.key} className="description-text">
                {field.label}
              </Label>

              {field.type === "select" && field.options ? (
                <select
                  id={field.key}
                  value={formData[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="description-text border p-2 rounded w-full"
                >
                  <option value="">None</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "multi-select" && field.options ? (
                <Select
                  isMulti
                  name={field.key}
                  options={field.options}
                  defaultValue={field.options.filter(
                    (opt: any) => opt.isHidden,
                  )}
                  className="description-text bg-white"
                  onChange={(selected: any) => {
                    console.log("selected", selected);
                    handleChange(
                      field.key,
                      selected.map((item: any) => item.value),
                    );
                  }}
                />
              ) : (
                <Input
                  id={field.key}
                  type={field.type ?? "text"}
                  placeholder={field.placeholder ?? `Enter ${field.label}`}
                  value={formData[field.key] ?? ""}
                  onChange={(e) =>
                    handleChange(field.key, e.target.value.toString())
                  }
                  className="description-text"
                />
              )}
            </div>
          ))}
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
