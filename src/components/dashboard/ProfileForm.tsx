"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { X, Plus, Save, Loader2 } from "lucide-react";
import { updateStudentProfile, type ProfileFormData } from "@/actions/profile";

interface ProfileFormProps {
  initialData?: {
    name: string;
    college: string;
    branch: string;
    academicYear: string;
    bio?: string;
    phoneNumber?: string;
    gender?: string;
    studentId?: string;
    interests: string[];
    profileImage?: string;
  };
}

const INTEREST_SUGGESTIONS = [
  "Coding", "Hackathons", "Music", "Dance", "Sports",
  "AI/ML", "Web Dev", "Gaming", "Robotics", "Startups",
  "Design", "Photography", "Writing", "Debate", "Quiz",
];

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [interests, setInterests] = useState<string[]>(initialData?.interests ?? []);
  const [interestInput, setInterestInput] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: initialData?.name ?? "",
      college: initialData?.college ?? "",
      branch: initialData?.branch ?? "",
      academicYear: initialData?.academicYear ?? "",
      bio: initialData?.bio ?? "",
      phoneNumber: initialData?.phoneNumber ?? "",
      gender: initialData?.gender ?? "",
      studentId: initialData?.studentId ?? "",
      interests: initialData?.interests ?? [],
      profileImage: initialData?.profileImage ?? "",
    },
  });

  const addInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (trimmed && !interests.includes(trimmed) && interests.length < 10) {
      setInterests([...interests, trimmed]);
      setInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const onSubmit = (data: ProfileFormData) => {
    startTransition(async () => {
      const result = await updateStudentProfile({ ...data, interests });
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        router.refresh();
        setTimeout(() => setMessage(null), 3000);
      }
    });
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl"
    >
      {/* Message */}
      {message && (
        <div
          className={`px-4 py-3 rounded-xl text-sm ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Name */}
      <FormField label="Full Name" error={errors.name?.message}>
        <input
          suppressHydrationWarning
          {...register("name", { required: "Name is required", minLength: { value: 2, message: "Name must be at least 2 characters" } })}
          className="form-input"
          placeholder="John Doe"
        />
      </FormField>

      {/* College & Branch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="College / University" error={errors.college?.message}>
          <input
            suppressHydrationWarning
            {...register("college", { required: "College is required" })}
            className="form-input"
            placeholder="IIT Bombay"
          />
        </FormField>
        <FormField label="Branch / Major" error={errors.branch?.message}>
          <input
            suppressHydrationWarning
            {...register("branch", { required: "Branch is required" })}
            className="form-input"
            placeholder="Computer Science"
          />
        </FormField>
      </div>

      {/* Academic Year */}
      <FormField label="Academic Year" error={errors.academicYear?.message}>
        <select
          suppressHydrationWarning
          {...register("academicYear", { required: "Academic year is required" })}
          className="form-input"
        >
          <option value="">Select year</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
          <option value="4th Year">4th Year</option>
          <option value="5th Year (Integrated)">5th Year (Integrated)</option>
          <option value="Postgraduate">Postgraduate</option>
          <option value="PhD">PhD</option>
        </select>
      </FormField>

      {/* Gender & Student ID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Gender" error={errors.gender?.message}>
          <select
            suppressHydrationWarning
            {...register("gender", { required: "Gender is required" })}
            className="form-input"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </FormField>
        <FormField label="Student ID / Roll Number" error={errors.studentId?.message}>
          <input
            suppressHydrationWarning
            {...register("studentId")}
            className="form-input"
            placeholder="123456"
          />
        </FormField>
      </div>

      {/* Phone Number */}
      <FormField label="Phone Number" error={errors.phoneNumber?.message}>
        <input
          suppressHydrationWarning
          {...register("phoneNumber", {
            pattern: {
              value: /^[+]?[0-9\s-]{10,15}$/,
              message: "Please enter a valid phone number",
            },
          })}
          className="form-input"
          placeholder="+91 98765 43210"
        />
      </FormField>

      {/* Bio */}
      <FormField label="Bio" error={errors.bio?.message}>
        <textarea
          suppressHydrationWarning
          {...register("bio", { maxLength: { value: 500, message: "Bio must be under 500 characters" } })}
          className="form-input min-h-[100px] resize-none"
          placeholder="Tell us a bit about yourself..."
        />
      </FormField>

      {/* Interests */}
      <div>
        <label className="text-sm font-medium text-text-muted mb-2 block">
          Interests <span className="text-text-faint">({interests.length}/10)</span>
        </label>

        <div className="flex flex-wrap gap-2 mb-3">
          {interests.map((interest) => (
            <span
              key={interest}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-lime/10 border border-lime/20 text-lime text-xs font-medium"
            >
              {interest}
              <button type="button" onClick={() => removeInterest(interest)} className="hover:text-white transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          <input
            suppressHydrationWarning
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addInterest(interestInput);
              }
            }}
            className="form-input flex-1"
            placeholder="Add an interest..."
          />
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => addInterest(interestInput)}
            className="px-3 py-2 rounded-xl bg-card border border-border text-text-faint hover:text-lime hover:border-lime/30 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {INTEREST_SUGGESTIONS.filter((s) => !interests.includes(s)).slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addInterest(s)}
              className="px-2.5 py-1 rounded-full text-[11px] text-text-faint bg-card border border-border hover:border-border-bright hover:text-text-muted transition-all"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        suppressHydrationWarning
        type="submit"
        disabled={isPending}
        className="btn btn-primary w-full sm:w-auto"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Profile
          </>
        )}
      </button>
    </motion.form>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-text-muted mb-2 block">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
