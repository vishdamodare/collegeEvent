"use server";

import { storageService } from "@/lib/storage";

export async function uploadFileAction(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file || file.size === 0) {
      return { success: false, error: "No file selected or file is empty" };
    }

    // Server-side validation: Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "File size exceeds the 5MB limit" };
    }

    // Server-side validation: Mime types
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: "Invalid file type. Only JPG, PNG, and PDF are allowed." };
    }

    // Perform upload
    const fileUrl = await storageService.uploadFile(file, folder);
    return { success: true, url: fileUrl };
  } catch (error: any) {
    console.error("File upload action failed:", error);
    return { success: false, error: error.message || "Failed to upload file" };
  }
}
