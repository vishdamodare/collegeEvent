import { FormField } from "@/types/admin/registration";

export const DEFAULT_FORM_FIELDS: FormField[] = [
  { id: "f-name", type: "text", label: "Full Name", required: true, placeholder: "Enter your full name" },
  { id: "f-email", type: "email", label: "Email Address", required: true, placeholder: "username@college.edu" },
  { id: "f-phone", type: "phone", label: "Phone Number", required: true, placeholder: "+91 XXXXX XXXXX" },
  { id: "f-college", type: "dropdown", label: "College Name", required: true, options: ["Vidyalankar Institute of Technology", "VJTI", "K.J. Somaiya", "Other"] },
  { id: "f-dept", type: "text", label: "Department / Branch", required: true, placeholder: "e.g. Information Technology" },
  { id: "f-year", type: "dropdown", label: "Academic Year", required: true, options: ["First Year", "Second Year", "Third Year", "Final Year"] }
];

export function getDefaultFormFields() {
  return [...DEFAULT_FORM_FIELDS];
}
