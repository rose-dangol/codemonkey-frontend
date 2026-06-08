import { useRef, useEffect, useState } from "react"; // + useState
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import RichTextEditor from "@/components/RichTextEditor";
import type { RichTextEditorRef } from "@/components/RichTextEditor";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GeneralPageService } from "@/services/GeneralPage/GeneralPage";
import type { GeneralPageDto } from "@/TypeDefinitions/GeneralPage";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

// ─── Validation Schema ─────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const pageSchema = z.object({
  heading: z
    .string()
    .min(1, "Heading is required")
    .max(100, "Heading must be under 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase with only letters, numbers, and hyphens",
    ),
  // ─── FIX: accept File (new upload), string (existing URL), or null ─────────
  bannerImage: z
    .union([
      z
        .instanceof(File)
        .refine((file) => file.size <= MAX_FILE_SIZE, "Max file size is 5MB"),
      z.string().min(1),
      z.null(),
    ])
    .optional(),
  description: z.string().min(1, "Description is required"),
});

type PageFormData = z.infer<typeof pageSchema>;

// ─── Component ─────────────────────────────────────────────────────────────────

const GeneralPageCreate = () => {
  const { id } = useParams();
  const editorRef = useRef<RichTextEditorRef>(null);

  // ─── FIX: use state instead of ref so React re-renders when preview changes ──
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const { data: initialData } = useQuery({
    queryKey: ["general-page", id],
    queryFn: () => GeneralPageService.getbyId(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      heading: "",
      slug: "",
      bannerImage: null,
      description: "",
    },
  });

  // ─── FIX: reset bannerImage to null; let the effect below set the preview ──
  useEffect(() => {
    if (initialData) {
      reset({
        heading: initialData.heading ?? "",
        slug: initialData.slug ?? "",
        description: initialData.description ?? "",
        bannerImage: initialData.bannerImage ?? null,
      });
    }
  }, [initialData, reset]);

  const bannerImage = watch("bannerImage");

  // ─── FIX: safely create/revoke object URLs and handle string URLs ───────────
  useEffect(() => {
    if (bannerImage instanceof File) {
      const url = URL.createObjectURL(bannerImage);
      setBannerPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    if (typeof bannerImage === "string" && bannerImage.length > 0) {
      setBannerPreview(bannerImage);
    } else {
      setBannerPreview(null);
    }
  }, [bannerImage]);

  // Flush editor HTML into RHF before validation
  const syncDescription = () => {
    const html = editorRef.current?.getHTML() || "";
    const isEmpty =
      !html ||
      html === "<p></p>" ||
      html === "<p><br></p>" ||
      html === "<p><br /></p>";
    setValue("description", isEmpty ? "" : html, { shouldValidate: true });
  };

  const addMutation = useMutation({
    mutationFn: (data: PageFormData) => {
      return GeneralPageService.create(data);
    },
    onSuccess: () => {
      toast.success("Page created successfully");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: GeneralPageDto) => {
      return GeneralPageService.update(id!, data);
    },
    onSuccess: () => {
      toast.success("Page updated successfully");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const onSubmit = async (data: GeneralPageDto) => {
    if (id) {
      updateMutation.mutate(data);
    } else {
      addMutation.mutate(data);
    }
  };

  const submitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    syncDescription();
    handleSubmit(onSubmit)();
  };

  return (
    <div className="bg-primary" style={{ minHeight: "100vh", padding: "2rem" }}>
      <form
        className="card bg-secondary"
        style={{ margin: "0 auto", padding: "2rem" }}
        onSubmit={submitWrapper}
        noValidate
      >
        {/* ─── Heading & Slug ────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            marginBottom: "1.75rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 16rem" }}>
            <label
              htmlFor="heading"
              className="sub-text"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 600,
              }}
            >
              Page Heading
            </label>
            <input
              id="heading"
              type="text"
              placeholder="Enter page heading..."
              className="bg-primary border-theme heading-font"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                outline: "none",
                fontSize: "1rem",
                borderColor: errors.heading ? "#ef4444" : undefined,
              }}
              {...register("heading")}
            />
            {errors.heading && (
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                {errors.heading.message}
              </span>
            )}
          </div>

          <div style={{ flex: "1 1 16rem" }}>
            <label
              htmlFor="slug"
              className="sub-text"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 600,
              }}
            >
              Page Slug
            </label>
            <input
              id="slug"
              type="text"
              placeholder="page-slug"
              className="bg-primary border-theme heading-font"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                outline: "none",
                fontSize: "1rem",
                borderColor: errors.slug ? "#ef4444" : undefined,
              }}
              {...register("slug")}
            />
            {errors.slug && (
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                {errors.slug.message}
              </span>
            )}
          </div>
        </div>

        {/* ─── Banner Image ──────────────────────────────────────── */}
        <div style={{ marginBottom: "1.75rem" }}>
          <label
            className="sub-text"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: 600,
            }}
          >
            Banner Image
          </label>

          <Controller
            name="bannerImage"
            control={control}
            render={({ field: { onChange } }) => (
              <div>
                {bannerImage ? (
                  <div
                    className="card"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      padding: 0,
                    }}
                  >
                    {/* ─── FIX: use bannerPreview state instead of ref + createObjectURL inline */}
                    <img
                      src={bannerPreview || ""}
                      alt="Banner preview"
                      style={{
                        width: "100%",
                        height: "16rem",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setBannerPreview(null);
                        onChange(null);
                      }}
                      className="state-color"
                      style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.5rem",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 500,
                        color: "#ffffff",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    className="bg-primary border-theme"
                    style={{
                      position: "relative",
                      borderStyle: "dashed",
                      borderWidth: "2px",
                      borderRadius: "0.75rem",
                      padding: "2.5rem",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        onChange(file);
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        cursor: "pointer",
                      }}
                    />
                    <div>
                      <svg
                        className="description-text"
                        style={{
                          margin: "0 auto",
                          height: "2.5rem",
                          width: "2.5rem",
                        }}
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p
                        className="description-text"
                        style={{
                          marginTop: "0.75rem",
                          fontSize: "0.875rem",
                        }}
                      >
                        <span
                          className="action-text"
                          style={{ fontWeight: 600 }}
                        >
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p
                        className="sub-text"
                        style={{
                          marginTop: "0.25rem",
                          fontSize: "0.75rem",
                        }}
                      >
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          />

          {errors.bannerImage && (
            <span
              style={{
                color: "#ef4444",
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                display: "block",
              }}
            >
              {errors.bannerImage.message}
            </span>
          )}
        </div>

        {/* ─── Description ───────────────────────────────────────── */}
        <div style={{ marginBottom: "2rem" }}>
          <label
            className="sub-text"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: 600,
            }}
          >
            Description
          </label>
          <div
            className="card bg-primary"
            style={{
              padding: "1rem",
              borderColor: errors.description ? "#ef4444" : undefined,
            }}
          >
            <RichTextEditor
              ref={editorRef}
              initialValue={initialData ? initialData?.description : " "}
            />
          </div>
          {errors.description && (
            <span
              style={{
                color: "#ef4444",
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                display: "block",
              }}
            >
              {errors.description.message}
            </span>
          )}
        </div>

        {/* ─── Actions ───────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
          }}
        >
          <button
            type="button"
            className="bg-secondary border-theme description-text"
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="action"
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: "0.5rem",
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontWeight: 600,
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeneralPageCreate;
