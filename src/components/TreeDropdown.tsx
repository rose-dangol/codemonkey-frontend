import React, { useMemo, useState } from "react";

type Option = {
  label: string;
  value: string;
  children?: Option[];
};

function filterTree(options: Option[], query: string): Option[] {
  if (!query) return options;

  const q = query.toLowerCase();

  const filter = (items: Option[]): Option[] => {
    return items
      .map((item) => {
        const match = item.label.toLowerCase().includes(q);

        const filteredChildren = item.children
          ? filter(item.children)
          : undefined;

        if (match || (filteredChildren && filteredChildren.length > 0)) {
          return {
            ...item,
            children: filteredChildren,
          };
        }

        return null;
      })
      .filter(Boolean) as Option[];
  };

  return filter(options);
}

type TreeListProps = {
  options: Option[];
  level?: number;
  onSelect: (val: string) => void;
  allowParentSelect?: boolean;
};

function TreeList({
  options,
  level = 0,
  onSelect,
  allowParentSelect = false,
}: TreeListProps) {
  return (
    <div>
      {options.map((item) => (
        <div key={item.value}>
          <div
            onClick={() => {
              if (allowParentSelect || !item.children?.length) {
                onSelect(item.value);
              }
            }}
            style={{
              paddingLeft: level * 16,
              cursor:
                !allowParentSelect && item.children?.length
                  ? "default"
                  : "pointer",
              opacity: !allowParentSelect && item.children?.length ? 0.6 : 1,
            }}
            className="py-1 hover:bg-gray-100 rounded"
          >
            {item.label}
          </div>

          {item.children?.length ? (
            <TreeList
              options={item.children}
              level={level + 1}
              onSelect={onSelect}
              allowParentSelect={allowParentSelect}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

function findLabel(options: Option[], value: string): string | undefined {
  if (!value) return undefined;
  for (const opt of options) {
    if (opt.value === value) return opt.label;
    if (opt.children) {
      const found = findLabel(opt.children, value);
      if (found) return found;
    }
  }
  return undefined;
}

export function TreeDropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  allowParentSelect = false,
  trigger,
}: {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  allowParentSelect?: boolean;
  trigger?: React.ReactNode;
}) {

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => filterTree(options, search),
    [options, search],
  );

  const selectedLabel = useMemo(
    () => findLabel(options, value),
    [options, value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <button
            type="button"
            className="border py-1 px-3 w-full text-left description-text rounded-[9px] bg-primary"
          >
            {selectedLabel || value || placeholder}
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent className="w-80 p-2">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />

        <div className="max-h-60 overflow-auto">
          <TreeList
            options={filtered}
            allowParentSelect={allowParentSelect}
            onSelect={(val) => {
              onChange(val);
              setOpen(false);
              setSearch("");
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
