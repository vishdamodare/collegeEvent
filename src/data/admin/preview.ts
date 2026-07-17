import { PreviewDevice } from "@/types/admin/preview";

export const PREVIEW_DEVICES: { id: PreviewDevice; name: string; width: string; icon: string }[] = [
  { id: "DESKTOP", name: "Desktop Preview", width: "100%", icon: "💻" },
  { id: "TABLET", name: "Tablet Preview", width: "768px", icon: "📱" },
  { id: "MOBILE", name: "Mobile Preview", width: "375px", icon: "📞" }
];

export function getPreviewDevices() {
  return PREVIEW_DEVICES;
}
