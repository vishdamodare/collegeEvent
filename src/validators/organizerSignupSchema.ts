import { z } from "zod";

export const organizerSignupSchema = z.object({
  // Personal Details
  name: z.string().trim().min(1, { message: "Full name is required" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Official email is required" })
    .email({ message: "Invalid email format" }),
  // Strip spaces/dashes/brackets, then require 10–15 digits with an optional leading +
  phone: z
    .string()
    .transform((v) => v.replace(/[\s\-()]/g, ""))
    .pipe(
      z.string().regex(/^\+?\d{10,15}$/, { message: "Enter a valid phone number (10–15 digits)" })
    ),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),

  // Institution Info
  college: z.string().trim().min(1, { message: "College / University is required" }),
  department: z.string().trim().min(1, { message: "Department or club is required" }),
  position: z.string().trim().min(1, { message: "Please select your role" }),

  // Verification Document
  verificationDocument: z.string().optional(),
});

export type OrganizerSignupInput = z.infer<typeof organizerSignupSchema>;
