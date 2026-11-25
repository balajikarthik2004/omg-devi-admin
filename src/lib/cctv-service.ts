import approachStream from "@/assets/cctv/cctv-07-approach.mp4";
import approachPoster from "@/assets/cctv/cctv-07-approach.jpg";
import gopuramCrowdStream from "@/assets/cctv/cctv-flow-02-gopuram-crowd.mp4";
import gopuramCrowdPoster from "@/assets/cctv/cctv-flow-02-gopuram-crowd.jpg";
import entrywayStream from "@/assets/cctv/cctv-01-entrance.mp4";
import entrywayPoster from "@/assets/cctv/cctv-01-entrance.jpg";
import counterStream from "@/assets/cctv/cctv-06-counter.mp4";
import counterPoster from "@/assets/cctv/cctv-06-counter.jpg";
import courtyardStream from "@/assets/cctv/cctv-flow-05-courtyard.mp4";
import courtyardPoster from "@/assets/cctv/cctv-flow-05-courtyard.jpg";
import mandapamStream from "@/assets/cctv/cctv-flow-06-mandapam-hall.mp4";
import mandapamPoster from "@/assets/cctv/cctv-flow-06-mandapam-hall.jpg";
import queueAStream from "@/assets/cctv/cctv-02-queue-a.mp4";
import queueAPoster from "@/assets/cctv/cctv-02-queue-a.jpg";
import queueBStream from "@/assets/cctv/cctv-03-queue-b.mp4";
import queueBPoster from "@/assets/cctv/cctv-03-queue-b.jpg";
import corridorStream from "@/assets/cctv/cctv-04-corridor.mp4";
import corridorPoster from "@/assets/cctv/cctv-04-corridor.jpg";
import match1 from "@/assets/cctv_match_1.png";
import match2 from "@/assets/cctv_match_2.png";
import match3 from "@/assets/cctv_match_3.png";

export const ZONES = [
  "Entrances & Exits",
  "Queues & Darshan",
  "Sanctum",
  "Counters",
  "Parking",
  "Office",
] as const;
export type Zone = (typeof ZONES)[number];
export type CameraStatus = "clear" | "normal" | "busy" | "crowded" | "alert" | "offline";
export type AlertType =
  | "crowd surge"
  | "overcrowding"
  | "unattended object"
  | "restricted area"
  | "camera offline";

type Sample = { timestamp: number; count: number };
export type Camera = {
  id: string;
  name: string;
  zone: Zone;
  countType: "people" | "vehicles";
  count: number;
  capacity: number;
  density: number;
  online: boolean;
  lastSeen: number;
  startedAt: number;
  status: CameraStatus;
  alertReason?: string;
  poster: string;
  stream: string;
  streamSpecs: {
    resolution: string;
    framesPerSecond: number;
    codec: string;
    bitrateMbps: number;
    tracking: boolean;
  };
  demo?: boolean;
  history: Sample[];
};
export type CctvAlert = {
  id: string;
  cameraId: string;
  type: AlertType;
  severity: "high" | "warning";
  message: string;
  timestamp: number;
  acknowledged: boolean;
};

export type Description = {
  gender: string;
  age: string;
  top: string;
  bottom: string;
  bag: boolean;
};
export type SearchScope = { cameraIds: string[]; from: number; to: number; confidence: number };
export type SearchAudit = {
  id: string;
  user: string;
  reason: string;
  caseRef: string;
  scope: SearchScope;
  timestamp: number;
  mode: "photo" | "description";
};
export type SearchRequest = Omit<SearchAudit, "id" | "timestamp" | "mode"> & {
  subject: { photo: File } | { description: Description };
};
export type Sighting = {
  id: string;
  cameraId: string;
  cameraName: string;
  zone: Zone;
  timestamp: number;
  confidence: number;
  thumbnail: string;
};
export type CameraScan = { cameraId: string; matches: Sighting[] };

const DEMO_LIVE = true;
const MINUTE = 60_000;
const AUDIT_KEY = "temple-cctv-search-audit";
const created = Date.now();
const seed: [string, Zone, number, number][] = [
  ["Outer Rajagopuram Approach", "Entrances & Exits", 95, 200],
  ["Main Gopuram Concourse", "Entrances & Exits", 187, 250],
  ["Temple Entryway Gateway", "Entrances & Exits", 142, 220],
  ["Footwear & Deposit Counter", "Counters", 89, 180],
  ["Outer Courtyard & Prakaram", "Entrances & Exits", 78, 190],
  ["Maha Mandapam & Columned Hall", "Queues & Darshan", 154, 210],
  ["General Darshan Queue Lane", "Queues & Darshan", 220, 235],
  ["VIP Special Darshan Lane", "Queues & Darshan", 178, 240],
  ["Inner Sanctum Approach Corridor", "Sanctum", 145, 260],
];
const feeds = [
  { stream: approachStream, poster: approachPoster },
  { stream: gopuramCrowdStream, poster: gopuramCrowdPoster },
  { stream: entrywayStream, poster: entrywayPoster },
  { stream: counterStream, poster: counterPoster },
  { stream: courtyardStream, poster: courtyardPoster },
  { stream: mandapamStream, poster: mandapamPoster },
  { stream: queueAStream, poster: queueAPoster },
  { stream: queueBStream, poster: queueBPoster },
  { stream: corridorStream, poster: corridorPoster },
];
type CameraRecord = Omit<Camera, "density" | "status" | "alertReason">;
let cameras: CameraRecord[] = seed.map(([name, zone, count, capacity], index) => ({
  id: "CAM-P" + String(index + 1).padStart(2, "0"),
  name,
  zone,
  count,
  capacity,
  countType: zone === "Parking" ? "vehicles" : "people",
  online: index !== 7,
  lastSeen: created - (index === 7 ? 12 * MINUTE : 0),
  startedAt: created - (18 + index) * 60 * MINUTE,
  ...feeds[index],
  demo: true,
  streamSpecs: {
    resolution: "1080p",
    framesPerSecond: 25,
    codec: "H.264",
    bitrateMbps: 4.2,
    tracking: true,
  },
  history: Array.from({ length: 11 }, (_, sample) => ({
    timestamp: created - (10 - sample) * MINUTE,
    count:
      sample === 10 ? count : Math.max(0, count - (10 - sample) * ((index % 3) + 1) + (sample % 4)),
  })),
}));
let alerts: CctvAlert[] = [
  {
    id: "a4",
    cameraId: "CAM-P04",
    type: "restricted area",
    severity: "high",
    message: "Movement detected inside the restricted approach.",
    timestamp: created - 2 * MINUTE,
    acknowledged: false,
  },
  {
    id: "a2",
    cameraId: "CAM-P02",
    type: "overcrowding",
    severity: "high",
    message: "Queue Lane A density exceeds the safe limit.",
    timestamp: created - 6 * MINUTE,
    acknowledged: false,
  },
  {
    id: "a1",
    cameraId: "CAM-P01",
    type: "crowd surge",
    severity: "warning",
    message: "Rapid inflow at Main Gopuram. 42 people entered in three minutes.",
    timestamp: created - 9 * MINUTE,
    acknowledged: false,
  },
  {
    id: "a8",
    cameraId: "CAM-P08",
    type: "camera offline",
    severity: "warning",
    message: "North chariot gate camera sensor requires inspection.",
    timestamp: created - 12 * MINUTE,
    acknowledged: true,
  },
  {
    id: "a7",
    cameraId: "CAM-P07",
    type: "unattended object",
    severity: "warning",
    message: "Unattended bag reported near the counter.",
    timestamp: created - 26 * MINUTE,
    acknowledged: true,
  },
];
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
let updates = 0;

export function occupancy(count: number, capacity: number) {
  return capacity > 0 ? Math.max(0, Math.min(100, Math.round((100 * count) / capacity))) : 0;
}

function resolveCamera(camera: CameraRecord): Camera {
  const density = occupancy(camera.count, camera.capacity);
  const activeAlert = alerts.find((alert) => alert.cameraId === camera.id && !alert.acknowledged);
  const status = activeAlert
    ? "alert"
    : !camera.online
      ? "offline"
      : density >= 85
        ? "crowded"
        : density >= 70
          ? "busy"
          : density > 0
            ? "normal"
            : "clear";
  return { ...camera, density, status, alertReason: activeAlert?.message };
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const publish = () => listeners.forEach((listener) => listener());

export async function getCameras() {
  await wait(120);
  return cameras.map(resolveCamera);
}
export async function getAlerts() {
  await wait(120);
  return alerts.slice();
}
export async function acknowledgeAlert(id: string) {
  alerts = alerts.map((alert) => (alert.id === id ? { ...alert, acknowledged: true } : alert));
  publish();
}
export async function retryCamera(id: string) {
  await wait(350);
  const now = Date.now();
  cameras = cameras.map((camera) =>
    camera.id === id && !camera.online
      ? { ...camera, online: true, startedAt: now, lastSeen: now }
      : camera,
  );
  publish();
}

function simulateUpdate() {
  const now = Date.now();
  cameras = cameras.map((camera) => {
    if (!camera.online) return camera;
    const drift = Math.round(Math.random() * 8) - 4;
    const count = Math.min(camera.capacity, Math.max(0, camera.count + drift));
    const history = camera.history.filter((point) => point.timestamp >= now - 10 * MINUTE);
    return { ...camera, count, lastSeen: now, history: [...history, { timestamp: now, count }] };
  });
  updates += 1;
  if (
    updates % 8 === 0 &&
    !alerts.some((alert) => alert.cameraId === "CAM-P05" && !alert.acknowledged)
  ) {
    alerts = [
      {
        id: "demo-" + now,
        cameraId: "CAM-P05",
        type: "crowd surge",
        severity: "warning",
        message: "Inflow increased near Prasad Counter.",
        timestamp: now,
        acknowledged: false,
      },
      ...alerts,
    ];
  }
  publish();
}

export function subscribeToCctv(listener: () => void) {
  listeners.add(listener);
  if (DEMO_LIVE && timer === undefined) timer = setInterval(simulateUpdate, 7000);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

let sessionAudit: SearchAudit[] = [];
function getStoredAudit(): SearchAudit[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(AUDIT_KEY) ?? "[]");
    return Array.isArray(stored) ? (stored as SearchAudit[]) : [];
  } catch {
    return [];
  }
}
export async function getSearchAudit(): Promise<SearchAudit[]> {
  return [...sessionAudit, ...getStoredAudit()].sort((a, b) => b.timestamp - a.timestamp);
}

export async function runPersonSearch(
  request: SearchRequest,
  onCamera: (scan: CameraScan) => void,
  signal: AbortSignal,
): Promise<Sighting[]> {
  const timestamp = Date.now();
  const { user, reason, caseRef, scope, subject } = request;
  const entry: SearchAudit = {
    id: crypto.randomUUID?.() ?? "scan-" + timestamp + "-" + Math.random().toString(36).slice(2),
    user,
    reason,
    caseRef,
    scope,
    timestamp,
    mode: "photo" in subject ? "photo" : "description",
  };
  try {
    localStorage.setItem(AUDIT_KEY, JSON.stringify([entry, ...getStoredAudit()]));
  } catch {
    sessionAudit = [entry, ...sessionAudit];
  }
  const selected = cameras.filter((camera) => scope.cameraIds.includes(camera.id));
  const fixtures = [
    [9, 2, 98],
    [8, 6, 96],
    [7, 11, 91],
    [3, 16, 88],
    [1, 22, 94],
  ];
  const matches = fixtures.flatMap(([number, minutes, confidence], index) => {
    const camera = cameras[number - 1];
    const seenAt = timestamp - minutes * MINUTE;
    if (
      !scope.cameraIds.includes(camera.id) ||
      confidence < scope.confidence ||
      seenAt < scope.from ||
      seenAt > scope.to
    )
      return [];
    return [
      {
        id: entry.id + "-" + index,
        cameraId: camera.id,
        cameraName: camera.name,
        zone: camera.zone,
        timestamp: seenAt,
        confidence,
        thumbnail: [match1, match2, match3][index % 3],
      },
    ];
  });
  for (const camera of selected) {
    await wait(4000 / selected.length);
    signal.throwIfAborted();
    onCamera({
      cameraId: camera.id,
      matches: matches.filter((match) => match.cameraId === camera.id),
    });
  }
  return matches;
}
