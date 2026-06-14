import type { VariantPayload } from "@/TypeDefinitions/ModalType";
import { useState } from "react";
import { VariantTab } from "./VariantTab";

type VariantEditorSectionProps = {
  variants: VariantPayload[];
  attributeDefinitions: { id: string; name: string }[];
  cogsDefinitions: { id: string; name: string; key: string }[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof VariantPayload, value: any) => void;
};

export function VariantEditorSection({
  variants,
  attributeDefinitions,
  cogsDefinitions,
  onAdd,
  onRemove,
  onChange,
}: VariantEditorSectionProps) {
  const [activeTab, setActiveTab] = useState(0);
  const clampedTab = Math.min(activeTab, Math.max(0, variants.length - 1));

  return (
    <div className="space-y-3">
      {/* Tab strip */}
      <div className="flex flex-wrap gap-2 items-center">
        {variants.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              clampedTab === i
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "border-border/60 description-text hover:bg-muted/50"
            }`}
          >
            Variant {i + 1}
          </button>
        ))}

        <button
          type="button"
          onClick={() => {
            onAdd();
            setActiveTab(variants.length); // auto-focus new tab
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-dashed border-blue-400 text-blue-500 hover:bg-blue-50 hover:border-blue-500 transition-all flex items-center gap-1"
        >
          <span className="text-base leading-none">+</span> Add Variant
        </button>
      </div>

      {/* Active variant form */}
      {variants.length > 0 && (
        <VariantTab
          key={clampedTab}
          index={clampedTab}
          data={variants[clampedTab]}
          attributeDefinitions={attributeDefinitions}
          cogsDefinitions={cogsDefinitions}
          onChange={onChange}
          onRemove={(i) => {
            onRemove(i);
            setActiveTab(Math.max(0, clampedTab - 1));
          }}
          isOnly={variants.length === 1}
        />
      )}
    </div>
  );
}
