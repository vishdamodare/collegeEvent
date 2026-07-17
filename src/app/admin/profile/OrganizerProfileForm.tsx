"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Clock } from "lucide-react";
import { updateOrganizerProfile } from "@/actions/admin";

const organizerProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  college: z.string().min(2, "College name is required"),
  department: z.string().min(2, "Department name is required"),
  position: z.string().min(2, "Organizer position is required"),
});

type FormValues = z.infer<typeof organizerProfileSchema>;

interface OrganizerProfileFormProps {
  initialData: {
    name: string;
    college: string;
    department: string;
    position: string;
    verificationStatus: string;
  };
}

export function OrganizerProfileForm({ initialData }: OrganizerProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(organizerProfileSchema),
    defaultValues: {
      name: initialData.name,
      college: initialData.college,
      department: initialData.department,
      position: initialData.position,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const res = await updateOrganizerProfile(values);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Profile saved successfully!");
        router.refresh();
      }
    } catch (err) {
      toast.error("Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* User Name */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-text-muted">Display Name</label>
            <input type="text" {...register("name")} className="form-input" />
            {errors.name && <p className="text-xs text-red-400 mt-1.5">{errors.name.message}</p>}
          </div>

          {/* College */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-text-muted">College/Institution</label>
            <input type="text" {...register("college")} className="form-input" />
            {errors.college && <p className="text-xs text-red-400 mt-1.5">{errors.college.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-text-muted">Department/Council</label>
              <input type="text" {...register("department")} className="form-input" />
              {errors.department && <p className="text-xs text-red-400 mt-1.5">{errors.department.message}</p>}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-text-muted">Position/Designation</label>
              <input type="text" {...register("position")} className="form-input" />
              {errors.position && <p className="text-xs text-red-400 mt-1.5">{errors.position.message}</p>}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-end">
          <button type="submit" className="btn btn-primary min-w-[120px]" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Side verification card status */}
      <div className="bg-card border border-border rounded-2xl p-6 h-fit space-y-4">
        <h3 className="font-bold text-sm text-text-main uppercase tracking-wider font-[family-name:var(--font-archivo)]">
          Verification Status
        </h3>

        {initialData.verificationStatus === "APPROVED" ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="block font-bold text-text-main text-xs uppercase mb-1">Approved Organizer</span>
              You have full administrative privileges to list events on the homepage, edit fests, and duplicate drafts.
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-start gap-3">
            <Clock className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="block font-bold text-text-main text-xs uppercase mb-1">Approval Pending</span>
              Your organizer application is under review. Some privileges may be limited until verified.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
