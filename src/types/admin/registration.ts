export interface FormField {
  id: string;
  type: "text" | "textarea" | "number" | "email" | "phone" | "date" | "dropdown" | "checkbox" | "radio" | "file" | "url";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  helpText?: string;
  validationRegex?: string;
  charLimit?: number;
}
