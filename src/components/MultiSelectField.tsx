import CreatableSelect from "react-select/creatable";
import { useState, useEffect } from "react";

type MultiSelectFieldProps = {
  field: any;
  value?: any[];
  // onChange?: (key: string, value: any) => void; // onchange ma kei error aayo vane this is fall backtype
  onChange?: ((value: any) => void) | ((key: string, value: any) => void);
  onPendingCreate?: (
    fieldKey: string,
    payload: { name: string; slug: string },
  ) => void;
};

function toSlug(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function MultiSelectField({
  field,
  value,
  onChange,
  onPendingCreate,
}: MultiSelectFieldProps) {
  // Keep a local controlled list of options (pre-existing + newly typed)
  const [localOptions, setLocalOptions] = useState<any[]>(field.options ?? []);

  useEffect(() => {
    setLocalOptions(field.options ?? []);
  }, [field.options]);

  // Derive selected options from value array to keep it fully controlled
  const selected = (value ?? [])
    .map((val) => {
      const found = localOptions.find((opt) => opt.value === val);
      if (found) return found;
      // If it is a placeholder that hasn't been added to localOptions yet,
      // create a temporary option so react-select displays it nicely.
      if (typeof val === "string" && val.startsWith("__new__")) {
        const slug = val.replace("__new__", "");
        return { label: slug, value: val };
      }
      return null;
    })
    .filter((opt): opt is any => opt !== null);

  const handleChange = (newSelected: any) => {
    const next = newSelected ?? [];
    onChange?.(
      field.key,
      next.map((item: any) => item.value),
    );
  };

  const handleCreate = (inputValue: string) => {
    const name = inputValue.trim();
    if (!name) return;
    const slug = toSlug(name);
    // Add chip visually
    const newOption = { label: name, value: `__new__${slug}`, __isNew: true };
    setLocalOptions((prev) => [...prev, newOption]);
    onChange?.(field.key, [...(value ?? []), newOption.value]);
    // Queue for actual creation on submit
    onPendingCreate?.(field.key, { name, slug });
  };

  return (
    <CreatableSelect
      isMulti
      name={field.key}
      options={localOptions}
      value={selected}
      className="description-text bg-white"
      onChange={handleChange}
      onCreateOption={handleCreate}
      formatCreateLabel={(inputValue: string) => `Add "${inputValue}"`}
    />
  );
}
