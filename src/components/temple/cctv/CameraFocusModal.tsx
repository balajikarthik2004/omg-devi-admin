import { useEffect, useRef, useState } from "react";
import { Camera as CameraIcon, ChevronLeft, ChevronRight, Move } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Camera, CctvAlert } from "@/lib/cctv-service";
import { CameraFeed, StreamSpecs } from "./CameraTile";
import { absoluteTime, isEditing, relativeTime, saveSnapshot } from "./presentation";

const DAY = 86_400_000;
export function CameraFocusModal({
  camera,
  events,
  now,
  initialPlayback,
  onClose,
  onStep,
}: {
  camera: Camera;
  events: CctvAlert[];
  now: number;
  initialPlayback: boolean;
  onClose: () => void;
  onStep: (step: number) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [playback, setPlayback] = useState<number | null>(() =>
    initialPlayback ? now - 360_000 : null,
  );
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (isEditing(event.target)) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        onStep(event.key === "ArrowLeft" ? -1 : 1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onStep]);
  const daily = events.filter((event) => event.timestamp >= now - DAY);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="cctv max-h-[90dvh] w-[calc(100%-1.5rem)] overflow-y-auto sm:max-w-5xl">
        <div className="pr-8">
          <DialogTitle className="text-xl font-extrabold">{camera.name}</DialogTitle>
          <DialogDescription>
            {camera.id} · {camera.zone}
          </DialogDescription>
        </div>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_225px]">
          <div className="min-w-0 space-y-3">
            <CameraFeed camera={camera} focus playback={playback} videoRef={video} />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <strong>{playback == null ? "Live feed" : absoluteTime(playback)}</strong>
              <Button
                size="sm"
                variant="outline"
                disabled={playback == null}
                onClick={() => setPlayback(null)}
              >
                Go live
              </Button>
            </div>
            <div className="relative pt-11">
              {daily.slice(0, 8).map((event, index) => (
                <button
                  key={event.id}
                  type="button"
                  aria-label={event.type + " at " + absoluteTime(event.timestamp)}
                  title={event.message}
                  onClick={() => setPlayback(event.timestamp)}
                  className="absolute z-10 size-3 -translate-x-1/2 rounded-full border border-white bg-primary"
                  style={{
                    left:
                      Math.max(2, Math.min(98, ((event.timestamp - now + DAY) / DAY) * 100)) + "%",
                    top: 2 + (index % 3) * 13,
                  }}
                />
              ))}
              <input
                type="range"
                aria-label="24-hour playback"
                min={0}
                max={1440}
                value={
                  playback == null
                    ? 1440
                    : Math.max(0, Math.min(1440, Math.round((playback - now + DAY) / 60_000)))
                }
                onChange={(event) => setPlayback(now - DAY + Number(event.target.value) * 60_000)}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>24 hours ago</span>
                <span>Now</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void saveSnapshot(camera, video.current)}
              >
                <CameraIcon /> Snapshot
              </Button>
              <span
                tabIndex={0}
                title="PTZ not configured"
                aria-label="PTZ not configured"
                className="rounded-md"
              >
                <Button type="button" size="sm" variant="outline" disabled>
                  <Move /> PTZ
                </Button>
              </span>
              <div className="ml-auto flex gap-1">
                <Button
                  type="button"
                  aria-label="Previous camera"
                  size="icon"
                  variant="outline"
                  onClick={() => onStep(-1)}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  type="button"
                  aria-label="Next camera"
                  size="icon"
                  variant="outline"
                  onClick={() => onStep(1)}
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </div>
          <aside className="space-y-4 rounded-xl border border-border bg-muted/45 p-4">
            <h3 className="text-sm font-bold">Camera details</h3>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-xs [&>dd]:text-right [&>dd]:font-semibold [&>dt]:text-muted-foreground">
              <dt>Zone</dt>
              <dd>{camera.zone}</dd>
              <dt>Uptime</dt>
              <dd>
                {camera.online
                  ? Math.floor(Math.max(0, now - camera.startedAt) / 3_600_000) +
                    "h " +
                    (Math.floor(Math.max(0, now - camera.startedAt) / 60_000) % 60) +
                    "m"
                  : "Offline"}
              </dd>
              <dt>Count</dt>
              <dd>
                {camera.count} {camera.countType}
              </dd>
              <dt>Capacity</dt>
              <dd>{camera.capacity}</dd>
              <dt>Density</dt>
              <dd>{camera.density}%</dd>
            </dl>
            <div className="grid gap-1 border-t border-border pt-3 text-xs font-semibold">
              <StreamSpecs camera={camera} />
            </div>
            <div className="space-y-2 border-t border-border pt-3">
              <h3 className="text-sm font-bold">Recent events</h3>
              {events.length ? (
                events.slice(0, 8).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setPlayback(event.timestamp)}
                    disabled={event.timestamp < now - DAY}
                    className="block w-full rounded text-left text-xs hover:text-secondary disabled:opacity-60"
                  >
                    <span className="block font-semibold capitalize">{event.type}</span>
                    <time title={absoluteTime(event.timestamp)} className="text-muted-foreground">
                      {relativeTime(event.timestamp, now)}
                    </time>
                  </button>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No recent events.</p>
              )}
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
