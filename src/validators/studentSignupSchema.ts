import { z } from "zod";

// Sign-up asks only what's needed to create the account. Branch, year and
// interests are optional here and can be filled in later from the profile page.
export const studentSignupSchema = z.object({
  name: z.string().trim().min(1, { message: "Full name is required" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  college: z.string().trim().min(1, { message: "College / University name is required" }),

  branch: z.string().optional().default(""),
  academicYear: z.string().optional().default(""),
  graduationYear: z
    .string()
    .regex(/^(\d{4})?$/, { message: "Graduation year must be a 4-digit number" })
    .optional()
    .default(""),
  rollNumber: z.string().optional(),
  interests: z.array(z.string()).optional().default([]),
  profileImage: z.string().optional(),
});

export type StudentSignupInput = z.infer<typeof studentSignupSchema>;
