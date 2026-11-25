import { useState, useRef, useEffect } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Camera,
  Scan,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Bell,
  Sparkles,
  Eye,
  EyeOff,
  Crosshair,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Sighting } from "@/lib/cctv-service";
import targetRefImg from "@/assets/cctv_target_person.jpg";
import { relativeTime } from "./presentation";

export function AiDetectionModal({
  sighting,
  allMatches,
  now,
  onClose,
  onSelectSighting,
  onGoToLiveCamera,
}: {
  sighting: Sighting | null;
  allMatches: Sighting[];
  now: number;
  onClose: () => void;
  onSelectSighting: (match: Sighting) => void;
  onGoToLiveCamera: (cameraId: string) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBox, setShowBox] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!sighting) return;
    setIsPlaying(false);
    const video = videoRef.current;
    if (video) {
      const freezeTime = sighting.boundingBox?.freezeTimeSec ?? 2.8;
      const applyFreeze = () => {
        try {
          video.currentTime = freezeTime;
          video.pause();
          setCurrentTime(freezeTime);
        } catch {
          // ignore
        }
      };

      video.pause();
      if (video.readyState >= 1) {
        applyFreeze();
      } else {
        video.addEventListener("loadedmetadata", applyFreeze, { once: true });
        video.addEventListener("loadeddata", applyFreeze, { once: true });
      }
      setCurrentTime(freezeTime);
    }
  }, [sighting?.id]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === " " && videoRef.current) {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (!sighting) return;
        const idx = allMatches.findIndex((m) => m.id === sighting.id);
        if (e.key === "ArrowLeft" && idx > 0) {
          onSelectSighting(allMatches[idx - 1]);
        } else if (e.key === "ArrowRight" && idx < allMatches.length - 1) {
          onSelectSighting(allMatches[idx + 1]);
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sighting, allMatches, onClose, onSelectSighting]);

  if (!sighting) return null;

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleResetToKeyframe = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setIsPlaying(false);
    const freezeTime = sighting.boundingBox?.freezeTimeSec ?? 2.8;
    video.currentTime = freezeTime;
    setCurrentTime(freezeTime);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSaveSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw detection box on snapshot
      if (sighting.boundingBox) {
        const bx = (sighting.boundingBox.x / 100) * canvas.width;
        const by = (sighting.boundingBox.y / 100) * canvas.height;
        const bw = (sighting.boundingBox.width / 100) * canvas.width;
        const bh = (sighting.boundingBox.height / 100) * canvas.height;

        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 4;
        ctx.strokeRect(bx, by, bw, bh);

        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(bx, by - 36, bw, 36);

        ctx.fillStyle = "#10b981";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(`AI MATCH ${sighting.confidence}% · ${sighting.cameraId}`, bx + 8, by - 12);
      }

      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/jpeg", 0.95);
      a.download = `cctv-detection-${sighting.cameraId}-${Date.now()}.jpg`;
      a.click();
      toast.success("Detection evidence snapshot downloaded");
    } catch {
      toast.error("Unable to generate snapshot");
    }
  };

  const currentIndex = allMatches.findIndex((m) => m.id === sighting.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allMatches.length - 1;

  const box = sighting.boundingBox || { x: 35, y: 15, width: 28, height: 75 };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI Person Detection Forensic View"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 lg:p-6 animate-in fade-in zoom-in-95 duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[96vh] flex flex-col rounded-2xl bg-slate-950 border border-emerald-500/30 text-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header / Forensic HUD Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 py-3 gap-2">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Scan size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold tracking-wide uppercase text-white">
                  AI Person Re-Identification · Forensic Sighting
                </h2>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 size={11} /> Verified Match {sighting.confidence}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {sighting.cameraName} ({sighting.cameraId}) · {sighting.zone} · Spotted{" "}
                {relativeTime(sighting.timestamp, now)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onGoToLiveCamera(sighting.cameraId);
              }}
              className="text-xs font-bold border-white/20 bg-white/5 hover:bg-white/15 text-white"
            >
              <ExternalLink size={13} className="mr-1 text-emerald-400" /> Live Stream
            </Button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Forensic View"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] flex-1 overflow-hidden min-h-0">
          {/* Left: Video Feed with AI Detection Bounding Box Overlay */}
          <div className="relative flex flex-1 flex-col bg-black justify-center items-center overflow-hidden min-h-[360px] lg:min-h-[500px] p-2 sm:p-4">
            {/* The 16:9 Video Canvas Frame */}
            <div className="relative aspect-video w-full max-w-[960px] max-h-[72vh] flex items-center justify-center bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
              {/* The Raw Video */}
              <video
                ref={videoRef}
                src={sighting.stream}
                poster={sighting.poster}
                muted
                playsInline
                loop
                onTimeUpdate={handleTimeUpdate}
                className="size-full object-cover"
              />

              {/* AI HUD Overlay Corner Brackets (High Tech Surveillance HUD) */}
              <div className="pointer-events-none absolute inset-3 flex flex-col justify-between">
                {/* Top Row HUD */}
                <div className="flex justify-between items-start text-[10px] font-mono tracking-wider text-emerald-400 drop-shadow">
                  <div className="bg-black/75 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>[AI RE-ID ACTIVE: OMG-VISION v4.2]</span>
                    </div>
                    <div className="text-slate-300 text-[9px]">
                      INFERENCE: 11.8ms · MODEL: YOLO-v11-ReID · FPS: 25.0
                    </div>
                  </div>

                  <div className="bg-black/75 px-2.5 py-1.5 rounded-lg border border-white/10 text-right text-slate-300">
                    <div>CAM: {sighting.cameraId}</div>
                    <div className="text-emerald-400 font-bold">
                      {isPlaying ? "LIVE PLAYBACK" : "KEYFRAME FROZEN"} @ {currentTime.toFixed(1)}s
                    </div>
                  </div>
                </div>

                {/* Bottom Row HUD */}
                <div className="flex justify-between items-end text-[10px] font-mono text-slate-300 drop-shadow">
                  <div className="bg-black/75 px-2.5 py-1 rounded-md border border-white/10">
                    ZONE: {sighting.zone.toUpperCase()}
                  </div>
                  <div className="bg-black/75 px-2.5 py-1 rounded-md border border-white/10 text-emerald-300">
                    SUBJ_ID: #V-8942 · 1080p FHD
                  </div>
                </div>
              </div>

              {/* AI Bounding Box Marking the Detected Person */}
              {showBox && (
                <div
                  className="pointer-events-none absolute transition-all duration-300"
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                  }}
                >
                  {/* Glowing Bounding Box Frame */}
                  <div className="relative size-full rounded-sm border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.7)]">
                    {/* High-tech Corner Accents */}
                    <div className="absolute -top-1.5 -left-1.5 size-3.5 border-t-2 border-l-2 border-white" />
                    <div className="absolute -top-1.5 -right-1.5 size-3.5 border-t-2 border-r-2 border-white" />
                    <div className="absolute -bottom-1.5 -left-1.5 size-3.5 border-b-2 border-l-2 border-white" />
                    <div className="absolute -bottom-1.5 -right-1.5 size-3.5 border-b-2 border-r-2 border-white" />

                    {/* Top Target Label Badge */}
                    <div className="absolute -top-8 left-0 flex items-center gap-1.5 bg-emerald-500 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded shadow-lg whitespace-nowrap uppercase tracking-wider">
                      <Crosshair size={12} className="animate-spin" />
                      <span>{box.label || `MATCH ${sighting.confidence}%`}</span>
                    </div>

                    {/* Bottom Attribute Strip */}
                    <div className="absolute -bottom-7 left-0 bg-black/90 border border-emerald-400/60 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                      CREAM SILK SHIRT · GOLD ZARI VESHTI · ANGAVASTRAM · TILAK
                    </div>

                    {/* Scanning Laser Line (when frozen) */}
                    {!isPlaying && (
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_10px_#10b981] animate-pulse" />
                    )}
                  </div>
                </div>
              )}

              {/* Video Controls Footer */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent p-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={togglePlay}
                    className="bg-white/10 hover:bg-white/20 border-white/20 text-white text-xs font-bold"
                  >
                    {isPlaying ? (
                      <>
                        <Pause size={13} className="mr-1 text-emerald-400" /> Pause Clip
                      </>
                    ) : (
                      <>
                        <Play size={13} className="mr-1 text-emerald-400 fill-emerald-400" /> Play Detection Clip
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleResetToKeyframe}
                    title="Return to frozen detection keyframe"
                    className="text-xs text-slate-300 hover:text-white hover:bg-white/10"
                  >
                    <RotateCcw size={13} className="mr-1" /> Freeze Keyframe
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowBox(!showBox)}
                    className="text-xs text-slate-300 hover:text-white hover:bg-white/10"
                  >
                    {showBox ? (
                      <>
                        <EyeOff size={13} className="mr-1" /> Hide AI Box
                      </>
                    ) : (
                      <>
                        <Eye size={13} className="mr-1 text-emerald-400" /> Show AI Box
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleSaveSnapshot}
                    className="bg-emerald-600/30 hover:bg-emerald-600/50 border-emerald-500/40 text-emerald-300 text-xs font-bold"
                  >
                    <Camera size={13} className="mr-1" /> Capture Evidence
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Forensic Target Comparison & Movement Timeline */}
          <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-white/10 bg-slate-900/60 p-4 overflow-y-auto space-y-4">
            {/* Reference vs Detected Comparison */}
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles size={13} className="text-emerald-400" /> Forensic Face & Biometric Re-ID
              </div>

              <div className="grid grid-cols-2 gap-2 bg-black/40 p-2 rounded-xl border border-white/10">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                    Uploaded Subject
                  </div>
                  <img
                    src={targetRefImg}
                    alt="Target Subject Photo"
                    className="aspect-[3/4] w-full rounded-lg object-cover border border-emerald-500/40 shadow-sm"
                  />
                </div>
                <div>
                  <div className="text-[9px] font-bold text-emerald-400 uppercase mb-1">
                    CCTV Sighting Match
                  </div>
                  <img
                    src={sighting.thumbnail}
                    alt="Sighting Crop"
                    className="aspect-[3/4] w-full rounded-lg object-cover border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  />
                </div>
              </div>

              <div className="mt-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-center">
                <div className="text-[10px] text-slate-300">Biometric & Feature Match Confidence</div>
                <div className="text-xl font-extrabold text-emerald-400">
                  {sighting.confidence}%
                </div>
              </div>
            </div>

            {/* AI Detected Attributes */}
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
                Identified Attributes
              </div>
              <ul className="space-y-1.5 text-xs">
                {(sighting.attributes || [
                  "Adult Male (26-32)",
                  "Traditional Cream Silk Shirt",
                  "Cream Dhoti / Veshti (Gold Zari Border)",
                  "Gold-Bordered Angavastram (Shoulder Shawl)",
                  "Forehead Vibhuti & Sandal Tilak",
                  "Trimmed Beard & Mustache",
                  "Black Watch (Left Wrist)",
                ]).map((attr, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-black/30 border border-white/5 px-2.5 py-1.5 text-slate-200 text-[11px]"
                  >
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    <span>{attr}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sighting Timeline Navigation */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                  Sightings Trail ({currentIndex + 1} of {allMatches.length})
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={!hasPrev}
                    onClick={() => hasPrev && onSelectSighting(allMatches[currentIndex - 1])}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-white transition-colors"
                    title="Previous sighting"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={!hasNext}
                    onClick={() => hasNext && onSelectSighting(allMatches[currentIndex + 1])}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-white transition-colors"
                    title="Next sighting"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                {allMatches.map((m) => {
                  const isCurrent = m.id === sighting.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onSelectSighting(m)}
                      className={`w-full flex items-center gap-2.5 rounded-xl p-2 text-left transition-all border ${
                        isCurrent
                          ? "bg-emerald-500/15 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                          : "bg-black/25 border-white/5 hover:border-white/20 hover:bg-black/40 text-slate-400"
                      }`}
                    >
                      <img
                        src={m.thumbnail}
                        alt=""
                        className="size-11 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div
                          className={`truncate text-xs font-bold ${
                            isCurrent ? "text-white" : "text-slate-200"
                          }`}
                        >
                          {m.cameraName}
                        </div>
                        <div className="text-[10px] text-slate-400">{m.cameraId} · {m.zone}</div>
                        <div className="text-[10px] text-emerald-400 font-semibold">
                          Seen {relativeTime(m.timestamp, now)} · {m.confidence}%
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-white/10">
              <Button
                type="button"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
                onClick={() =>
                  toast.success(
                    `Security personnel dispatched to ${sighting.cameraName} (${sighting.cameraId})`
                  )
                }
              >
                <Bell size={13} className="mr-1.5" /> Dispatch Guard to {sighting.cameraId}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
