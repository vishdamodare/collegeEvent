"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EventStatus } from "@prisma/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Event date & time is required"),
  location: z.string().min(3, "Location/Venue is required"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  status: z.nativeEnum(EventStatus).default(EventStatus.DRAFT),
  imageUrl: z.string().url("Must be a valid image URL").optional().or(z.literal("")),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string;
    categoryId: string;
    date: Date;
    location: string;
    capacity: number;
    status: EventStatus;
    imageUrl?: string | null;
  } | null;
  categories: Array<{ id: string; name: string }>;
  onSubmit: (data: any) => Promise<{ success?: boolean; error?: string }>;
}

export function EventForm({ initialData, categories, onSubmit }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventFormSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      categoryId: initialData?.categoryId || "",
      date: initialData?.date ? new Date(initialData.date).toISOString().slice(0, 16) : "",
      location: initialData?.location || "",
      capacity: initialData?.capacity || 100,
      status: initialData?.status || EventStatus.DRAFT,
      imageUrl: initialData?.imageUrl || "",
    },
  });

  const titleValue = watch("title");

  // Auto-generate slug preview
  useEffect(() => {
    if (titleValue) {
      const generated = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated || "event");
    } else {
      setSlug("");
    }
  }, [titleValue]);

  const onFormSubmit = async (values: EventFormValues) => {
    setLoading(true);
    try {
      const res = await onSubmit({
        ...values,
        date: new Date(values.date),
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(initialData ? "Event updated successfully!" : "Event created successfully!");
        router.push("/admin/events");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-2xl bg-card border border-border rounded-2xl p-6 md:p-8">
      <div className="grid grid-cols-1 gap-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-text-muted">Event Title</label>
          <input
            type="text"
            placeholder="e.g. Genesis Hackathon"
            {...register("title")}
            className="form-input"
          />
          {errors.title && <p className="text-xs text-red-400 mt-1.5">{errors.title.message}</p>}
          {slug && (
            <p className="text-[11px] text-text-faint mt-1.5 font-mono">
              Slug Preview: <span className="text-lime">/events/{slug}</span>
            </p>
          )}
        </div>

        {/* Short Description & Description */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-text-muted">Full Description</label>
          <textarea
            rows={5}
            placeholder="Describe your event schedule, timeline, judges, after-party, and prizes..."
            {...register("description")}
            className="form-input resize-none"
          />
          {errors.description && <p className="text-xs text-red-400 mt-1.5">{errors.description.message}</p>}
        </div>

        {/* Image Uploader wrapper */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-text-muted">Banner Image URL</label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/... or Cloudinary URL"
            {...register("imageUrl")}
            className="form-input"
          />
          {errors.imageUrl && <p className="text-xs text-red-400 mt-1.5">{errors.imageUrl.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-text-muted">Category</label>
            <select {...register("categoryId")} className="form-input">
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-red-400 mt-1.5">{errors.categoryId.message}</p>}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-text-muted">Capacity (Seats)</label>
            <input
              type="number"
              placeholder="100"
              {...register("capacity")}
              className="form-input"
            />
            {errors.capacity && <p className="text-xs text-red-400 mt-1.5">{errors.capacity.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date & Time */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-text-muted">Event Date & Time</label>
            <input
              type="datetime-local"
              {...register("date")}
              className="form-input"
            />
            {errors.date && <p className="text-xs text-red-400 mt-1.5">{errors.date.message}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-text-muted">Venue / Location</label>
            <input
              type="text"
              placeholder="e.g. Auditorium, BITS Pilani"
              {...register("location")}
              className="form-input"
            />
            {errors.location && <p className="text-xs text-red-400 mt-1.5">{errors.location.message}</p>}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-text-muted">Initial Status</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                value={EventStatus.DRAFT}
                {...register("status")}
                className="w-4 h-4 text-lime focus:ring-lime"
              />
              Draft (Hidden from public)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                value={EventStatus.PUBLISHED}
                {...register("status")}
                className="w-4 h-4 text-lime focus:ring-lime"
              />
              Publish immediately
            </label>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/events")}
          className="btn btn-glass"
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary min-w-[120px]" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : initialData ? "Save Changes" : "Create Event"}
        </button>
      </div>
    </form>
  );
}
