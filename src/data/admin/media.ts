import { MediaAsset } from "@/types/admin/media";

export const MOCK_MEDIA_ASSETS: MediaAsset[] = [];

export function uploadMediaAsset(file: { name: string; size: number; type: string }): MediaAsset {
  const assetType = file.type.startsWith("image/") ? "IMAGE" : file.type === "application/pdf" ? "PDF" : "VIDEO";
  const newAsset: MediaAsset = {
    id: `med-${Math.random().toString(36).substr(2, 9)}`,
    type: assetType,
    url: `/uploads/${file.name}`,
    name: file.name,
    sizeBytes: file.size,
    progress: 100
  };
  MOCK_MEDIA_ASSETS.push(newAsset);
  return newAsset;
}
