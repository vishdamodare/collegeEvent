import { promises as fs } from "fs";
import path from "path";

export interface StorageService {
  uploadFile(file: File, folder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

class LocalStorageService implements StorageService {
  async uploadFile(file: File, folder: string): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    
    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique name
    const ext = path.extname(file.name) || ".png";
    const filename = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Save file
    await fs.writeFile(filePath, buffer);

    // Return relative URL path
    return `/uploads/${folder}/${filename}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl.startsWith("/uploads/")) return;
    
    const filePath = path.join(process.cwd(), "public", fileUrl);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error(`Failed to delete file at ${filePath}:`, err);
    }
  }
}

// Decoupled Storage Provider exported here.
export const storageService: StorageService = new LocalStorageService();
