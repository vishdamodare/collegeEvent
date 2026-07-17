export interface MediaAsset {
  id: string;
  type: "IMAGE" | "VIDEO" | "PDF";
  url: string;
  name: string;
  sizeBytes?: number;
  progress?: number;
}
