import { z } from "zod";

export const organizerSignupSchema = z.object({
  // Personal Details
  name: z.string().min(1, { message: "Full name is required" }),
  email: z
    .string()
    .min(1, { message: "Official work email is required" })
    .email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
  
  // Institution Info
  college: z.string().min(1, { message: "Institution Name is required" }),
  department: z.string().min(1, { message: "Department is required" }),
  position: z.string().min(1, { message: "Position selection is required" }),
  
  // Verification Document
  verificationDocument: z.string().optional(),
});

export type OrganizerSignupInput = z.infer<typeof organizerSignupSchema>;
