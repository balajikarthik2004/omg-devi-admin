import { toast } from "sonner";
import type { Camera, CameraStatus } from "@/lib/cctv-service";

export const field =
  "min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring";
export const panel = "rounded-xl border border-border bg-card shadow-sm";
export const muted = "text-xs text-muted-foreground";
export const statusStyle: Record<CameraStatus, { pill: string; bar: string }> = {
  clear: { pill: "bg-emerald-50 text-emerald-800", bar: "bg-status-normal" },
  normal: { pill: "bg-emerald-100 text-emerald-800", bar: "bg-status-normal" },
  busy: { pill: "bg-amber-100 text-amber-900", bar: "bg-status-busy" },
  crowded: { pill: "bg-red-100 text-red-800", bar: "bg-status-crowded" },
  alert: { pill: "bg-destructive text-destructive-foreground", bar: "bg-danger" },
  offline: { pill: "bg-slate-200 text-slate-800", bar: "bg-slate-400" },
};
export function relativeTime(timestamp: number, now: number) {
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (seconds < 60) return seconds < 5 ? "Just now" : seconds + "s ago";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + "m ago";
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? hours + "h ago" : Math.floor(hours / 24) + "d ago";
}
export function clockTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("en-IN", { hour12: false });
}
export function absoluteTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-IN");
}
export function isEditing(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || !!target.closest("input, textarea, select, [role=slider]"))
  );
}
export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export async function saveSnapshot(camera: Camera, video: HTMLVideoElement | null) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    toast.error("Snapshot unavailable");
    return;
  }
  try {
    if (video && video.readyState >= 2 && video.videoWidth > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
    } else {
      const response = await fetch(camera.poster);
      if (!response.ok) throw new Error("Poster unavailable");
      const bitmap = await createImageBitmap(await response.blob());
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      context.drawImage(bitmap, 0, 0);
      bitmap.close();
    }
    canvas.toBlob((blob) => {
      if (blob) download(blob, camera.id + "-snapshot.png");
      else toast.error("Snapshot unavailable");
    }, "image/png");
  } catch {
    toast.error("Snapshot unavailable");
  }
}
