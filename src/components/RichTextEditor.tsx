import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useEditor,
  EditorContent,
  Editor,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/core";
import { Node, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}

// ─── Resizable Image Extension ────────────────────────────────────────────────
// Custom TipTap node that renders with drag-handles for visual resizing.
// The actual pixel data is untouched; only the display width/height attrs change.

const ResizableImageView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);
  const [showHandles, setShowHandles] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const width = node.attrs.width ?? "100%";
  const alignment = node.attrs.alignment ?? "left";

  const alignClass: Record<string, string> = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setResizing(true);
      startX.current = e.clientX;
      const el = imgRef.current;
      startWidth.current = el
        ? el.offsetWidth
        : typeof width === "number"
          ? width
          : 300;

      const onMove = (mv: MouseEvent) => {
        const delta = mv.clientX - startX.current;
        const newWidth = Math.max(80, startWidth.current + delta);
        updateAttributes({ width: newWidth });
      };
      const onUp = () => {
        setResizing(false);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [updateAttributes, width],
  );

  const containerStyle: React.CSSProperties = {
    display: "block",
    position: "relative",
    width: typeof width === "number" ? `${width}px` : width,
  };

  return (
    <NodeViewWrapper
      as="div"
      style={{
        display: "flex",
        justifyContent:
          alignment === "center"
            ? "center"
            : alignment === "right"
              ? "flex-end"
              : "flex-start",
        margin: "12px 0",
        userSelect: "none",
      }}
    >
      <div
        ref={containerRef}
        style={containerStyle}
        className={`relative group ${alignClass[alignment] ?? ""}`}
        onMouseEnter={() => setShowHandles(true)}
        onMouseLeave={() => !resizing && setShowHandles(false)}
      >
        {/* Image */}
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt ?? ""}
          title={node.attrs.title ?? ""}
          draggable={false}
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            borderRadius: "8px",
            outline: selected ? "2px solid #3b82f6" : "none",
            outlineOffset: "2px",
            cursor: resizing ? "ew-resize" : "default",
          }}
        />

        {/* Resize handle — right edge */}
        {(showHandles || resizing || selected) && (
          <div
            onMouseDown={handleMouseDown}
            title="Drag to resize"
            style={{
              position: "absolute",
              right: -6,
              top: "50%",
              transform: "translateY(-50%)",
              width: 12,
              height: 36,
              background: "white",
              border: "1.5px solid #93c5fd",
              borderRadius: 6,
              cursor: "ew-resize",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", gap: 2 }}>
              <div
                style={{
                  width: 1.5,
                  height: 14,
                  background: "#93c5fd",
                  borderRadius: 1,
                }}
              />
              <div
                style={{
                  width: 1.5,
                  height: 14,
                  background: "#93c5fd",
                  borderRadius: 1,
                }}
              />
            </div>
          </div>
        )}

        {/* Alignment controls — appear on hover */}
        {(showHandles || selected) && (
          <div
            style={{
              position: "absolute",
              top: -34,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 4,
              background: "white",
              border: "1px solid #e7e5e4",
              borderRadius: 8,
              padding: "3px 4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              zIndex: 20,
              whiteSpace: "nowrap",
            }}
          >
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                type="button"
                title={`Align ${align}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  updateAttributes({ alignment: align });
                }}
                style={{
                  width: 26,
                  height: 26,
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: alignment === align ? "#1c1917" : "transparent",
                  color: alignment === align ? "white" : "#78716c",
                  transition: "all 0.15s",
                }}
              >
                {align === "left" && (
                  <svg
                    width={13}
                    height={13}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="15" y2="12" />
                    <line x1="3" y1="18" x2="17" y2="18" />
                  </svg>
                )}
                {align === "center" && (
                  <svg
                    width={13}
                    height={13}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="7" y1="12" x2="17" y2="12" />
                    <line x1="5" y1="18" x2="19" y2="18" />
                  </svg>
                )}
                {align === "right" && (
                  <svg
                    width={13}
                    height={13}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="9" y1="12" x2="21" y2="12" />
                    <line x1="7" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            ))}
            <div style={{ width: 1, background: "#e7e5e4", margin: "3px 0" }} />
            {/* Size presets */}
            {(
              [
                ["S", 200],
                ["M", 400],
                ["L", "100%"],
              ] as [string, number | string][]
            ).map(([label, val]) => (
              <button
                key={label}
                type="button"
                title={`Size ${label}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  updateAttributes({ width: val });
                }}
                style={{
                  width: 26,
                  height: 26,
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  background: "transparent",
                  color: "#78716c",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f5f5f4")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

const ResizableImage = Node.create({
  name: "resizableImage",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: "100%" },
      alignment: { default: "left" },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

// ─── Toolbar Button ───────────────────────────────────────────────────────────

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive = false,
  title,
  children,
  disabled = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    aria-pressed={isActive}
    className={[
      "inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-all duration-150 select-none",
      "hover:bg-stone-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed",
      isActive
        ? "bg-stone-800 text-white hover:bg-stone-700"
        : "text-stone-600 hover:text-stone-900",
    ].join(" ")}
  >
    {children}
  </button>
);

// ─── Toolbar Divider ──────────────────────────────────────────────────────────

const ToolbarDivider = () => (
  <div className="w-px h-5 bg-stone-200 mx-1 self-center shrink-0" />
);

// ─── Icon helper ──────────────────────────────────────────────────────────────

const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const icons = {
  bold: "M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z",
  italic: "M19 4h-9M14 20H5M14.7 4.7L9.2 19.4",
  underline: "M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3 M4 21h16",
  strike: "M16 4H9a3 3 0 0 0-2.83 4M14 12a4 4 0 0 1 0 8H6 M4 12h16",
  bulletList: "M9 6h11 M9 12h11 M9 18h11 M5 6v.01 M5 12v.01 M5 18v.01",
  orderedList:
    "M10 6h11 M10 12h11 M10 18h11 M4 6h1v4 M4 10H6 M6 18H4c0-1 2-2 2-3s-1-1.5-2-1",
  blockquote:
    "M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z",
  table:
    "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
  image: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  alignLeft: "M21 6H3 M15 12H3 M17 18H3",
  alignCenter: "M21 6H3 M17 12H7 M19 18H5",
  alignRight: "M21 6H3 M21 12H9 M21 18H11",
  undo: "M3 7v6h6 M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13",
  redo: "M21 7v6h-6 M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13",
  deleteTable:
    "M3 6h18 M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6 M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",
};

// ─── Heading Selector ─────────────────────────────────────────────────────────

const HeadingSelector: React.FC<{ editor: Editor }> = ({ editor }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const levels = [1, 2, 3, 4, 5, 6] as const;
  const currentLevel = levels.find((l) =>
    editor.isActive("heading", { level: l }),
  );
  const label = currentLevel ? `H${currentLevel}` : "¶";

  const handleSelect = (level: (typeof levels)[number] | null) => {
    if (level === null) editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level }).run();
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as globalThis.Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "inline-flex items-center gap-1 px-2 h-8 rounded-md text-xs font-semibold transition-all duration-150 select-none",
          "hover:bg-stone-100 active:scale-95 border border-stone-200",
          open ? "bg-stone-100 text-stone-900" : "text-stone-600",
        ].join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Heading / Paragraph"
      >
        <span className="min-w-[20px] text-center">{label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={10}
          height={10}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-full left-0 mt-1 z-50 bg-white border border-stone-200 rounded-lg shadow-lg py-1 min-w-[130px] overflow-hidden"
        >
          <button
            type="button"
            role="option"
            onClick={() => handleSelect(null)}
            className={[
              "w-full text-left px-3 py-1.5 text-sm transition-colors",
              !currentLevel
                ? "bg-stone-800 text-white"
                : "text-stone-700 hover:bg-stone-50",
            ].join(" ")}
          >
            Paragraph
          </button>
          {levels.map((l) => {
            const sizes = [
              "text-xl",
              "text-lg",
              "text-base",
              "text-sm",
              "text-xs",
              "text-xs",
            ];
            const weights = [
              "font-bold",
              "font-bold",
              "font-semibold",
              "font-semibold",
              "font-medium",
              "font-medium",
            ];
            return (
              <button
                key={l}
                type="button"
                role="option"
                onClick={() => handleSelect(l)}
                className={[
                  "w-full text-left px-3 py-1.5 transition-colors",
                  sizes[l - 1],
                  weights[l - 1],
                  editor.isActive("heading", { level: l })
                    ? "bg-stone-800 text-white"
                    : "text-stone-700 hover:bg-stone-50",
                ].join(" ")}
              >
                H{l} — Heading {l}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Table Controls ───────────────────────────────────────────────────────────

const TableControls: React.FC<{ editor: Editor; inTable: boolean }> = ({
  editor,
  inTable,
}) => (
  <>
    <ToolbarButton
      onClick={() =>
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run()
      }
      title="Insert Table"
      isActive={inTable}
    >
      <Icon d={icons.table} />
    </ToolbarButton>
    {inTable && (
      <>
        <ToolbarButton
          onClick={() => editor.chain().focus().addRowAfter().run()}
          title="Add Row Below"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="12" y1="18" x2="12" y2="21" />
            <line x1="10" y1="19.5" x2="14" y2="19.5" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          title="Add Column Right"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
            <line x1="18" y1="12" x2="21" y2="12" />
            <line x1="19.5" y1="10" x2="19.5" y2="14" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().deleteRow().run()}
          title="Delete Row"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="17" x2="15" y2="17" stroke="#ef4444" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().deleteColumn().run()}
          title="Delete Column"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
            <line x1="17" y1="9" x2="17" y2="15" stroke="#ef4444" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().deleteTable().run()}
          title="Delete Table"
        >
          <Icon d={icons.deleteTable} />
        </ToolbarButton>
      </>
    )}
  </>
);

// ─── Image Upload Button ──────────────────────────────────────────────────────

// const ImageUploadButton: React.FC<{ editor: Editor }> = ({ editor }) => {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [uploading, setUploading] = useState(false);

//   // Mock upload — replace body with real Cloudinary/S3 fetch in production
//   const mockUpload = async (file: File): Promise<string> =>
//     new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onload = () =>
//         setTimeout(() => resolve(reader.result as string), 600);
//       reader.readAsDataURL(file);
//     });

//   const handleFileChange = useCallback(
//     async (e: React.ChangeEvent<HTMLInputElement>) => {
//       const file = e.target.files?.[0];
//       if (!file) return;
//       const allowed = [
//         "image/jpeg",
//         "image/png",
//         "image/gif",
//         "image/webp",
//         "image/svg+xml",
//       ];
//       if (!allowed.includes(file.type)) {
//         alert("Unsupported file type.");
//         return;
//       }
//       if (file.size > 10 * 1024 * 1024) {
//         alert("Max 10 MB.");
//         return;
//       }
//       setUploading(true);
//       try {
//         const url = await mockUpload(file);
//         // Insert our custom resizable image node
//         editor
//           .chain()
//           .focus()
//           .insertContent({
//             type: "resizableImage",
//             attrs: {
//               src: url,
//               alt: file.name,
//               width: "100%",
//               alignment: "left",
//             },
//           })
//           .run();
//       } catch {
//         alert("Upload failed. Please try again.");
//       } finally {
//         setUploading(false);
//         if (fileInputRef.current) fileInputRef.current.value = "";
//       }
//     },
//     [editor],
//   );

//   return (
//     <div className="relative">
//       <input
//         ref={fileInputRef}
//         type="file"
//         accept="image/*"
//         className="sr-only"
//         onChange={handleFileChange}
//         aria-label="Upload image"
//       />
//       <ToolbarButton
//         onClick={() => fileInputRef.current?.click()}
//         title="Insert Image"
//         disabled={uploading}
//       >
//         {uploading ? (
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width={16}
//             height={16}
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth={2}
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             aria-hidden
//             className="animate-spin"
//           >
//             <path d="M21 12a9 9 0 1 1-6.219-8.56" />
//           </svg>
//         ) : (
//           <Icon d={icons.image} />
//         )}
//       </ToolbarButton>
//     </div>
//   );
// };

// ─── Toolbar ──────────────────────────────────────────────────────────────────
// KEY FIX: We subscribe to editor state via an onUpdate counter so that
// editor.isActive() calls return fresh values and trigger re-renders.

const Toolbar: React.FC<{ editor: Editor }> = ({ editor }) => {
  // Force re-render whenever the editor selection or content changes.
  // This is the correct way to make isActive() reactive in TipTap v2/v3.
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const update = () => forceUpdate((n) => n + 1);
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  const isBold = editor.isActive("bold");
  const isItalic = editor.isActive("italic");
  const isUnderline = editor.isActive("underline");
  const isStrike = editor.isActive("strike");
  const isBullet = editor.isActive("bulletList");
  const isOrdered = editor.isActive("orderedList");
  const isBlockquote = editor.isActive("blockquote");
  const inTable = editor.isActive("table");
  const isAlignLeft = editor.isActive({ textAlign: "left" });
  const isAlignCenter = editor.isActive({ textAlign: "center" });
  const isAlignRight = editor.isActive({ textAlign: "right" });

  return (
    <div
      className="flex items-center flex-wrap gap-0.5 px-3 py-2 border-b border-stone-200 bg-stone-50/80 backdrop-blur-sm sticky top-0 z-10 rounded-t-xl"
      role="toolbar"
      aria-label="Text formatting"
    >
      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Icon d={icons.undo} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Y)"
      >
        <Icon d={icons.redo} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Heading / Paragraph */}
      <HeadingSelector editor={editor} />

      <ToolbarDivider />

      {/* Inline formatting — all properly reactive now */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={isBold}
        title="Bold (Ctrl+B)"
      >
        <Icon d={icons.bold} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={isItalic}
        title="Italic (Ctrl+I)"
      >
        <Icon d={icons.italic} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={isUnderline}
        title="Underline (Ctrl+U)"
      >
        <Icon d={icons.underline} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={isStrike}
        title="Strikethrough"
      >
        <Icon d={icons.strike} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={isAlignLeft}
        title="Align Left"
      >
        <Icon d={icons.alignLeft} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={isAlignCenter}
        title="Align Center"
      >
        <Icon d={icons.alignCenter} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={isAlignRight}
        title="Align Right"
      >
        <Icon d={icons.alignRight} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={isBullet}
        title="Bullet List"
      >
        <Icon d={icons.bulletList} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={isOrdered}
        title="Ordered List"
      >
        <Icon d={icons.orderedList} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Block */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={isBlockquote}
        title="Blockquote"
      >
        <Icon d={icons.blockquote} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Table */}
      <TableControls editor={editor} inTable={inTable} />

      <ToolbarDivider />

      {/* Image */}
      {/* <ImageUploadButton editor={editor} /> */}
    </div>
  );
};

// ─── Submit Panel ─────────────────────────────────────────────────────────────

const SubmitPanel: React.FC<{ editor: Editor }> = ({ editor }) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const json = editor.getJSON();
    const html = editor.getHTML();
    const text = editor.getText();
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    const output = {
      metadata: {
        submittedAt: new Date().toISOString(),
        wordCount: words,
        charCount: chars,
      },
      content: { json, html, text },
    };
    console.log("═══════════════════════════════════════");
    console.log("📝 Rich Text Editor — Submitted Content");
    console.log("═══════════════════════════════════════");
    console.log("Metadata:", output.metadata);
    console.log("\nJSON (TipTap Document):", output.content.json);
    console.log("\nHTML:", output.content.html);
    console.log("\nPlain Text:", output.content.text);
    console.log("═══════════════════════════════════════");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  const text = editor.getText();
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-stone-200 bg-stone-50/60 rounded-b-xl">
      <div className="flex items-center gap-4 text-xs text-stone-400 font-medium">
        <span>
          <span className="text-stone-600 font-semibold">{words}</span> words
        </span>
        <span>
          <span className="text-stone-600 font-semibold">{chars}</span> chars
        </span>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className={[
          "inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95",
          submitted
            ? "bg-emerald-600 text-white shadow-emerald-200 shadow-md"
            : "bg-stone-900 hover:bg-stone-700 text-white shadow-stone-300 shadow-md hover:shadow-lg",
        ].join(" ")}
      >
        {submitted ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={15}
              height={15}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Logged to Console
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={15}
              height={15}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Submit
          </>
        )}
      </button>
    </div>
  );
};

// ─── Main Editor ──────────────────────────────────────────────────────────────

export interface RichTextEditorRef {
  getHTML: () => string;
  getJSON: () => any;
  getText: () => string;
}

export interface RichTextEditorProps {
  initialValue?: string;
  showSubmitPanel?: boolean;
}

const RichTextEditor = React.forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ initialValue = "", showSubmitPanel = false }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3, 4, 5, 6] },
          // Disable code & codeBlock — removed per requirements
          code: false,
          codeBlock: false,
        }),
        Underline,
        TextStyle,
        TextAlign.configure({
          types: ["heading", "paragraph"],
          defaultAlignment: "left",
        }),
        ResizableImage, // custom node with drag-resize + alignment controls
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader,
        TableCell,
        Placeholder.configure({
          placeholder:
            "Start writing… Select text to format it, or use the toolbar above.",
        }),
      ],
      content: initialValue || `<h1>Welcome write your content here</h1>`,
      editorProps: {
        attributes: {
          class:
            "prose prose-stone max-w-none min-h-[400px] px-8 py-6 focus:outline-none",
          spellCheck: "true",
        },
      },
    });

    React.useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || "",
      getJSON: () => editor?.getJSON() || {},
      getText: () => editor?.getText() || "",
    }));

    // Sync content if initialValue changes externally
    React.useEffect(() => {
      if (editor && initialValue !== undefined && initialValue !== editor.getHTML()) {
        editor.commands.setContent(initialValue);
      }
    }, [initialValue, editor]);

    if (!editor) {
      return (
        <div className="flex items-center justify-center h-64 text-stone-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="animate-spin mr-3"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Loading editor…
        </div>
      );
    }

    return (
      <div className="w-full">
        {/* Editor card */}
        <div className="mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-stone-200/80 overflow-hidden ring-1 ring-stone-100">
            <Toolbar editor={editor} />
            <div
              className="relative cursor-text"
              onClick={() => editor.chain().focus().run()}
            >
              <EditorContent editor={editor} />
            </div>
            {showSubmitPanel && <SubmitPanel editor={editor} />}
          </div>

          {/* Keyboard shortcuts */}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-stone-400 px-1">
            {[
              ["Ctrl+B", "Bold"],
              ["Ctrl+I", "Italic"],
              ["Ctrl+U", "Underline"],
              ["Ctrl+Z", "Undo"],
              ["Ctrl+Y", "Redo"],
            ].map(([key, label]) => (
              <span key={key}>
                <kbd className="bg-stone-100 border border-stone-200 rounded px-1 py-0.5 font-mono text-[10px] text-stone-500">
                  {key}
                </kbd>{" "}
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
