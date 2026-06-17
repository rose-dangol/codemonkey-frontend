import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type VariantImage = {
  url: string;
  sortOrder: number;
  file?: File;
};

type MultiImageFieldProps = {
  value: VariantImage[];
  onChange: (value: VariantImage[]) => void;
  name?: string;
  label?: string;
};

export function MultiImageField({
  value,
  onChange,
  label,
}: MultiImageFieldProps) {
  const images = value ?? [];

  const updateImageAtIndex = (index: number, data: VariantImage) => {
    const updated = [...images];
    updated[index] = data;
    onChange(updated);
  };

  return (
    <div className="space-y-2 ">
      <Label>{label}</Label>

      {[0, 1, 2].map((i) => {
        const img = images[i];

        return (
          <div key={i} className="grid grid-cols-2 gap-2 items-center">
            {/* FILE INPUT */}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                updateImageAtIndex(i, {
                  file,
                  url: URL.createObjectURL(file),
                  sortOrder: img?.sortOrder ?? i + 1,
                });
              }}
            />

            {/* SORT ORDER */}
            <Input
              type="number"
              value={img?.sortOrder ?? i + 1}
              onChange={(e) => {
                updateImageAtIndex(i, {
                  ...(img ?? {
                    url: "",
                    file: undefined,
                  }),
                  sortOrder: Number(e.target.value),
                });
              }}
            />
          </div>
        );
      })}

      {/* PREVIEW */}
      <div className="flex gap-2 mt-2">
        {images.map((img, idx) =>
          img?.url ? (
            <img
              key={idx}
              src={img.url}
              alt={`preview-${idx}`}
              className="w-16 h-16 object-cover rounded border"
            />
          ) : null,
        )}
      </div>
    </div>
  );
}
