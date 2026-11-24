import { Camera as CameraIcon, Car, Expand, Play, RotateCw, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useState, type RefObject } from "react";
import { retryCamera, type Camera } from "@/lib/cctv-service";
import { absoluteTime, clockTime, saveSnapshot, relativeTime, statusStyle } from "./presentation";

export function StreamSpecs({ camera }: { camera: Camera }) {
  const { resolution, framesPerSecond, codec, bitrateMbps, tracking } = camera.streamSpecs;
  return (
    <>
      <span>
        {resolution} · {framesPerSecond} FPS
      </span>
      <span>
        {codec} · {bitrateMbps} Mbps
      </span>
      <span>AI TRACKING: {camera.online && tracking ? "ACTIVE" : "INACTIVE"}</span>
    </>
  );
}

function seekDemo(video: HTMLVideoElement, time?: number | null) {
  if (time != null && Number.isFinite(video.duration) && video.duration > 0) {
    video.currentTime = (time / 1000) % video.duration;
  }
}

export function CameraFeed({
  camera,
  compact = false,
  focus = false,
  playback,
  videoRef,
}: {
  camera: Camera;
  compact?: boolean;
  focus?: boolean;
  playback?: number | null;
  videoRef: RefObject<HTMLVideoElement | null>;
}) {
  const number = Number(camera.id.slice(-2));
  useEffect(() => {
    if (focus) return;
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "96px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [camera.online, camera.stream, focus, videoRef]);

  useEffect(() => {
    if (videoRef.current) seekDemo(videoRef.current, playback);
  }, [playback, videoRef]);
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-950 text-white">
      <img
        src={camera.poster}
        alt=""
        className={
          "absolute inset-0 size-full object-cover " + (camera.online ? "" : "grayscale opacity-45")
        }
        style={{ objectPosition: 25 + number * 4 + "% " + (30 + number * 3) + "%" }}
      />
      {camera.online && (
        <video
          ref={videoRef}
          src={camera.stream}
          poster={camera.poster}
          muted
          autoPlay={focus}
          preload={focus ? "auto" : "none"}
          onLoadedMetadata={(event) =>
            seekDemo(event.currentTarget, playback ?? (camera.demo ? number * 529 : null))
          }
          loop
          playsInline
          aria-hidden="true"
          className="cctv-video absolute inset-0 size-full object-cover"
          style={{ objectPosition: 25 + number * 4 + "% " + (30 + number * 3) + "%" }}
        />
      )}
      <div aria-hidden="true" className="cctv-feed-shade pointer-events-none absolute inset-0" />
      {camera.online &&
        playback == null &&
        Array.from({ length: camera.count ? 3 : 0 }, (_, index) => {
          const width = 9 + index * 2;
          const height = 17 + index * 2;
          const x = Math.min(100 - width - 2, 12 + ((number * 11 + index * 25) % 74));
          const y = Math.min(80 - height, 37 + ((number * 7 + index * 13) % 33));
          return (
            <div
              key={index}
              aria-hidden="true"
              className="cctv-track pointer-events-none absolute rounded-[2px] border border-emerald-300/75"
              style={{ left: x + "%", top: y + "%", width: width + "%", height: height + "%" }}
            >
              {!compact && (
                <span
                  className={
                    "absolute bottom-full whitespace-nowrap bg-emerald-950/90 px-1 text-[8px] font-bold " +
                    (x > 65 ? "right-0" : "left-0")
                  }
                >
                  #{32 + index} · {98 - index * 3}%
                </span>
              )}
            </div>
          );
        })}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap justify-between gap-1 p-2 text-[9px] font-bold uppercase">
        <span className="flex items-center gap-1.5 rounded-md bg-black/75 px-2 py-1">
          <span
            className={
              "size-1.5 rounded-full " +
              (camera.online && playback == null
                ? "bg-primary motion-safe:animate-pulse"
                : "bg-slate-400")
            }
          />
          {playback != null ? "Playback" : camera.online ? "LIVE" : "No signal"}
        </span>
        <span className={"ml-auto rounded-md px-2 py-1 " + statusStyle[camera.status].pill}>
          {camera.status}
        </span>
      </div>
      {!focus && camera.online && (
        <div className="pointer-events-none absolute inset-x-2 top-10 flex flex-wrap gap-x-2 gap-y-1 rounded bg-black/80 px-2 py-1 text-[9px] font-semibold opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <StreamSpecs camera={camera} />
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent px-2.5 pt-5 pb-2">
        <div className="text-[9px] font-bold tracking-wider text-white/85">{camera.id}</div>
        <div className="truncate text-sm font-bold" title={camera.name}>
          {camera.name}
        </div>
        {camera.alertReason && (
          <div
            title={camera.alertReason}
            className="truncate text-[10px] font-semibold text-red-200"
          >
            {camera.alertReason}
          </div>
        )}
      </div>
    </div>
  );
}

function Sparkline({ camera }: { camera: Camera }) {
  if (!camera.history.length) return null;
  const counts = camera.history.map(({ count }) => count);
  const min = Math.min(...counts);
  const range = Math.max(1, Math.max(...counts) - min);
  const first = camera.history[0].timestamp;
  const end = camera.history[camera.history.length - 1].timestamp;
  const points = camera.history
    .map(
      ({ timestamp, count }) =>
        1 +
        ((timestamp - first) * 62) / Math.max(1, end - first) +
        "," +
        (17 - ((count - min) * 15) / range),
    )
    .join(" ");
  return (
    <svg
      role="img"
      aria-label="Count over the last 10 minutes"
      viewBox="0 0 64 19"
      className="h-4 w-14 shrink-0 text-indigo-200"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CameraTile({
  camera,
  now,
  compact,
  highlighted,
  flashKey,
  onOpen,
}: {
  camera: Camera;
  now: number;
  compact: boolean;
  highlighted: boolean;
  flashKey?: number;
  onOpen: (id: string, playback?: boolean) => void;
}) {
  const Icon = camera.countType === "people" ? UserRound : Car;
  const [retrying, setRetrying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  async function reconnect() {
    setRetrying(true);
    try {
      await retryCamera(camera.id);
      toast.success(camera.id + " reconnected");
    } catch {
      toast.error("Unable to reconnect " + camera.id);
    } finally {
      setRetrying(false);
    }
  }
  return (
    <article
      id={"tile-" + camera.id}
      data-status={camera.status}
      className={
        "cctv-tile group relative min-w-0 scroll-mt-24 rounded-xl border bg-slate-900 p-2 text-white shadow-sm " +
        (camera.status === "alert"
          ? " cctv-tile-alert border-primary"
          : camera.status === "crowded"
            ? " border-status-crowded/55"
            : " border-secondary/50") +
        (highlighted ? " ring-2 ring-secondary ring-offset-2" : "")
      }
    >
      {flashKey !== undefined && (
        <div
          key={flashKey}
          aria-hidden="true"
          className="cctv-flash pointer-events-none absolute inset-0 z-20 rounded-xl"
        />
      )}
      <div className="relative">
        <button
          type="button"
          aria-label={"Open " + camera.name}
          title={camera.name}
          onClick={() => onOpen(camera.id)}
          className="block w-full rounded-lg text-left"
        >
          <CameraFeed camera={camera} compact={compact} videoRef={video} />
        </button>
        <div className="cctv-tile-actions absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 rounded-lg bg-black/85 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          {(
            [
              [Expand, "Expand", () => onOpen(camera.id)],
              [CameraIcon, "Snapshot", () => void saveSnapshot(camera, video.current)],
              [Play, "Playback", () => onOpen(camera.id, true)],
            ] as const
          ).map(([Action, label, act]) => (
            <button
              key={label}
              aria-label={label + " " + camera.id}
              title={label}
              onClick={act}
              type="button"
              className="grid size-8 place-items-center rounded-md hover:bg-white/20"
            >
              <Action size={14} />
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2 px-1 pt-2 pb-1">
        <div className="flex flex-wrap items-center justify-between gap-x-1 gap-y-0.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <Icon size={15} className="shrink-0 text-indigo-200" />
            <strong className="text-sm tabular-nums">{camera.count.toLocaleString("en-IN")}</strong>
            <span className="truncate text-xs text-slate-300">
              / {camera.capacity} {camera.countType}
            </span>
          </div>
          <span className="text-[10px] font-semibold tabular-nums text-slate-300">
            {camera.density}%
          </span>
        </div>
        <div
          role="meter"
          aria-label="Camera density"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={camera.density}
          className="h-1.5 overflow-hidden rounded-full bg-white/15"
        >
          <div
            className={"h-full rounded-full " + statusStyle[camera.status].bar}
            style={{ width: camera.density + "%" }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-medium text-slate-300">
          <time
            dateTime={new Date(camera.online ? now : camera.lastSeen).toISOString()}
            title={camera.online ? undefined : absoluteTime(camera.lastSeen)}
            className="tabular-nums"
          >
            {camera.online ? clockTime(now) : "Last seen " + relativeTime(camera.lastSeen, now)}
          </time>
          {camera.online ? (
            <Sparkline camera={camera} />
          ) : (
            <button
              type="button"
              disabled={retrying}
              onClick={() => void reconnect()}
              className="flex items-center gap-1 rounded text-xs font-semibold text-indigo-200 disabled:opacity-60"
            >
              <RotateCw size={12} /> {retrying ? "Connecting…" : "Retry"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
