import type { Ref } from "react";
import {
  Activity,
  AlertTriangle,
  Car,
  LayoutGrid,
  List,
  Search,
  Users,
  UsersRound,
  ScanFace,
} from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  occupancy,
  ZONES,
  type Camera,
  type CameraStatus,
  type CctvAlert,
  type Zone,
} from "@/lib/cctv-service";
import { field, panel } from "./presentation";
import { CameraTile } from "./CameraTile";

export type GridSize = 2 | 3 | 4;
export type CameraSort = "Severity" | "Name" | "Count";

export function CctvTabs() {
  return (
    <TabsList
      aria-label="CCTV view"
      className="cctv-view-tabs h-auto w-fit max-w-full flex-wrap justify-start gap-2 p-0"
    >
      <TabsTrigger value="live" className="gap-2 px-3 py-2 text-xs font-bold">
        <LayoutGrid size={16} /> Live Grid
      </TabsTrigger>
      <TabsTrigger value="search" className="gap-2 px-3 py-2 text-xs font-bold">
        <ScanFace size={16} /> AI Person Search
      </TabsTrigger>
    </TabsList>
  );
}

export function CctvKpiStrip({
  cameras,
  alerts,
  now,
  loading,
}: {
  cameras: Camera[];
  alerts: CctvAlert[];
  now: number;
  loading: boolean;
}) {
  const cutoff = now - 180_000;
  const weightedDensity = (group: Camera[], count: (camera: Camera) => number) => {
    const totalCapacity = group.reduce((sum, camera) => sum + camera.capacity, 0);
    return totalCapacity
      ? Math.round(
          group.reduce(
            (sum, camera) => sum + occupancy(count(camera), camera.capacity) * camera.capacity,
            0,
          ) / totalCapacity,
        )
      : 0;
  };
  const previous = (camera: Camera) =>
    [...camera.history].reverse().find((sample) => sample.timestamp <= cutoff)?.count ??
    camera.count;
  const total = (group: Camera[], getCount: (camera: Camera) => number) =>
    group.reduce((sum, camera) => sum + getCount(camera), 0);
  const people = cameras.filter((camera) => camera.countType === "people");
  const queues = people.filter((camera) => camera.zone === "Queues & Darshan");
  const vehicles = cameras.filter((camera) => camera.countType === "vehicles");
  const current = (camera: Camera) => camera.count;
  const change = (delta: number, unit = "") => (delta > 0 ? "+" : "") + delta + unit + " in 3 min";
  const density = weightedDensity(people, current);
  const active = alerts.filter((alert) => !alert.acknowledged);
  const kpis = [
    {
      label: "Total People",
      value: total(people, current),
      trend: change(total(people, current) - total(people, previous)),
      icon: Users,
      tone: "gold",
    },
    {
      label: "In Queues",
      value: total(queues, current),
      trend: change(total(queues, current) - total(queues, previous)),
      icon: UsersRound,
      tone: "gold",
    },
    {
      label: "Vehicles",
      title: "Vehicles (Parking)",
      value: total(vehicles, current),
      trend: change(total(vehicles, current) - total(vehicles, previous)),
      icon: Car,
      tone: "green",
    },
    {
      label: "Anomalies",
      value: active.length,
      trend: active.filter((alert) => alert.timestamp >= cutoff).length + " new in 3 min",
      icon: AlertTriangle,
      tone: "red",
    },
    {
      label: "Avg Density",
      value: density + "%",
      trend: change(density - weightedDensity(people, previous), " pp"),
      icon: Activity,
      tone: "green",
    },
  ];
  return (
    <section aria-label="Camera metrics" className="cctv-metrics">
      {kpis.map(({ label, title, value, trend, icon: Icon, tone }) =>
        loading ? (
          <Skeleton key={label} className="h-[5.25rem] rounded-xl" />
        ) : (
          <div key={label} title={title} data-tone={tone} className="cctv-metric">
            <span className="cctv-metric-icon" aria-hidden="true">
              <Icon size={21} />
            </span>
            <div className="min-w-0">
              <div className="text-xs font-bold">{label}</div>
              <div className="text-xl leading-tight font-extrabold tabular-nums">
                {value.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] font-medium text-muted-foreground">{trend}</div>
              {label === "Avg Density" && (
                <progress
                  aria-label="Average density"
                  value={density}
                  max={100}
                  className="cctv-progress mt-1"
                />
              )}
            </div>
          </div>
        ),
      )}
    </section>
  );
}

export function CctvToolbar({
  cameras,
  zone,
  setZone,
  query,
  setQuery,
  searchRef,
  sort,
  setSort,
  status,
  setStatus,
  size,
  setSize,
  view,
  setView,
}: {
  cameras: Camera[];
  zone: Zone | "All";
  setZone: (value: Zone | "All") => void;
  query: string;
  setQuery: (value: string) => void;
  searchRef: Ref<HTMLInputElement>;
  sort: CameraSort;
  setSort: (value: CameraSort) => void;
  status: CameraStatus | "All";
  setStatus: (value: CameraStatus | "All") => void;
  size: GridSize;
  setSize: (value: GridSize) => void;
  view: "grid" | "list";
  setView: (value: "grid" | "list") => void;
}) {
  return (
    <div className="cctv-toolbar">
      <div role="group" aria-label="Camera zones" className="flex flex-wrap gap-1.5">
        {(["All", ...ZONES] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={zone === item}
            onClick={() => setZone(item)}
            className="cctv-zone"
          >
            {item}{" "}
            <span className="tabular-nums">
              (
              {item === "All"
                ? cameras.length
                : cameras.filter((camera) => camera.zone === item).length}
              )
            </span>
          </button>
        ))}
      </div>
      <div className="cctv-toolbar-controls flex min-w-0 flex-wrap items-center gap-1.5">
        <label className="relative min-w-28 flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            ref={searchRef}
            aria-label="Search cameras by name or ID"
            placeholder="Search cameras"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={field + " w-full pl-8"}
          />
        </label>
        <select
          aria-label="Filter by camera severity"
          value={status}
          onChange={(event) => setStatus(event.target.value as CameraStatus | "All")}
          className={field}
        >
          <option value="All">Severity</option>
          <option value="alert">Alert</option>
          <option value="crowded">Crowded</option>
          <option value="busy">Busy</option>
          <option value="normal">Normal</option>
          <option value="clear">Clear</option>
          <option value="offline">Offline</option>
        </select>
        <select
          aria-label="Sort cameras"
          value={sort}
          onChange={(e) => setSort(e.target.value as CameraSort)}
          className={field}
        >
          <option value="Severity">Priority</option>
          <option>Name</option>
          <option>Count</option>
        </select>
        <div className="cctv-view-switch" role="group" aria-label="Camera layout">
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            type="button"
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <List size={16} />
          </button>
        </div>
        <div role="group" aria-label="Grid columns" className="cctv-grid-size">
          <select
            className={field}
            aria-label="Grid columns"
            value={size}
            disabled={view === "list"}
            onChange={(event) => setSize(Number(event.target.value) as GridSize)}
          >
            <option value={2}>2 columns</option>
            <option value={3}>3 columns</option>
            <option value={4}>4 columns</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export function CameraGrid({
  cameras,
  size,
  view,
  now,
  loading,
  highlight,
  flashed,
  onOpen,
}: {
  cameras: Camera[];
  size: GridSize;
  view: "grid" | "list";
  now: number;
  loading: boolean;
  highlight: string | null;
  flashed: { id: string; key: number } | null;
  onOpen: (id: string, playback?: boolean) => void;
}) {
  return (
    <section
      aria-label={view === "grid" ? "Camera grid" : "Camera list"}
      aria-busy={loading}
      data-columns={size}
      data-view={view}
      className="cctv-grid"
    >
      {loading ? (
        Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
        ))
      ) : cameras.length ? (
        cameras.map((camera) => (
          <CameraTile
            key={camera.id}
            camera={camera}
            now={now}
            compact={size === 4}
            highlighted={highlight === camera.id}
            flashKey={flashed?.id === camera.id ? flashed.key : undefined}
            onOpen={onOpen}
          />
        ))
      ) : (
        <p className={panel + " col-span-full p-6 text-sm text-muted-foreground"}>
          No cameras match these filters.
        </p>
      )}
    </section>
  );
}
