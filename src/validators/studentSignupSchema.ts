import { z } from "zod";

export const studentSignupSchema = z.object({
  // Step 1: Personal
  name: z.string().min(1, { message: "Full name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Must contain at least one special character" }),
  confirmPassword: z.string().min(1, { message: "Password confirmation is required" }),
  
  // Step 2: Academic
  college: z.string().min(1, { message: "College / University Name is required" }),
  branch: z.string().min(1, { message: "Branch / Major is required" }),
  academicYear: z.string().min(1, { message: "Current Year selection is required" }),
  graduationYear: z
    .string()
    .min(1, { message: "Graduation year is required" })
    .regex(/^\d{4}$/, { message: "Graduation year must be a 4-digit number" }),
  rollNumber: z.string().optional(),
  
  // Step 3: Interests
  interests: z.array(z.string()).min(1, { message: "Please select at least one interest" }),
  
  // Step 4: Profile
  profileImage: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type StudentSignupInput = z.infer<typeof studentSignupSchema>;
