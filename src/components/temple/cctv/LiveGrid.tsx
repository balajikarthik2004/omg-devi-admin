import type { Ref } from "react";
import {
  Activity,
  AlertTriangle,
  Car,
  Columns2,
  Search,
  Users,
  UsersRound,
  Video,
  ScanFace,
} from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { occupancy, ZONES, type Camera, type CctvAlert, type Zone } from "@/lib/cctv-service";
import { field, panel } from "./presentation";
import { CameraTile } from "./CameraTile";

export type GridSize = 2 | 3 | 4;
export type CameraSort = "Severity" | "Name" | "Count";

export function CctvTabs() {
  return (
    <TabsList
      aria-label="CCTV view"
      className="h-auto w-fit max-w-full flex-wrap justify-start gap-1 rounded-xl border border-border bg-card p-1"
    >
      <TabsTrigger
        value="live"
        className="gap-1.5 px-2.5 py-1.5 text-xs font-semibold sm:px-3 sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      >
        <Video size={16} /> Live Grid
      </TabsTrigger>
      <TabsTrigger
        value="search"
        className="gap-1.5 px-2.5 py-1.5 text-xs font-semibold sm:px-3 sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      >
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
      tone: "bg-secondary-tint text-secondary",
    },
    {
      label: "In Queues",
      value: total(queues, current),
      trend: change(total(queues, current) - total(queues, previous)),
      icon: UsersRound,
      tone: "bg-amber-50 text-amber-800",
    },
    {
      label: "Vehicles",
      title: "Vehicles (Parking)",
      value: total(vehicles, current),
      trend: change(total(vehicles, current) - total(vehicles, previous)),
      icon: Car,
      tone: "bg-secondary-tint text-secondary",
    },
    {
      label: "Anomalies",
      value: active.length,
      trend: active.filter((alert) => alert.timestamp >= cutoff).length + " new in 3 min",
      icon: AlertTriangle,
      tone: "bg-red-50 text-primary",
    },
    {
      label: "Avg Density",
      value: density + "%",
      trend: change(density - weightedDensity(people, previous), " pp"),
      icon: Activity,
      tone: "bg-emerald-50 text-emerald-800",
    },
  ];
  return (
    <section
      aria-label="Camera metrics"
      className="grid auto-cols-[148px] grid-flow-col gap-2.5 overflow-x-auto pb-1 min-[1000px]:auto-cols-fr"
    >
      {kpis.map(({ label, title, value, trend, icon: Icon, tone }) =>
        loading ? (
          <Skeleton key={label} className="h-24 rounded-xl" />
        ) : (
          <div key={label} title={title} className={panel + " min-h-24 min-w-0 p-3"}>
            <div className="flex items-center gap-2">
              <span className={"grid size-7 shrink-0 place-items-center rounded-md " + tone}>
                <Icon size={15} />
              </span>
              <span className="text-xs font-semibold text-muted-foreground">{label}</span>
            </div>
            <div className="mt-1 text-xl font-extrabold tabular-nums">
              {value.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] font-medium text-muted-foreground">{trend}</div>
            {label === "Avg Density" && (
              <progress
                aria-label="Average density"
                value={density}
                max={100}
                className="cctv-progress mt-1"
              />
            )}
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
  size,
  setSize,
}: {
  cameras: Camera[];
  zone: Zone | "All";
  setZone: (value: Zone | "All") => void;
  query: string;
  setQuery: (value: string) => void;
  searchRef: Ref<HTMLInputElement>;
  sort: CameraSort;
  setSort: (value: CameraSort) => void;
  size: GridSize;
  setSize: (value: GridSize) => void;
}) {
  return (
    <div className={panel + " flex flex-wrap items-center gap-3 p-3"}>
      <div role="group" aria-label="Camera zones" className="flex flex-wrap gap-1.5">
        {(["All", ...ZONES] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={zone === item}
            onClick={() => setZone(item)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-2 text-xs font-semibold hover:bg-muted aria-pressed:border-secondary/20 aria-pressed:bg-secondary-tint aria-pressed:text-secondary"
          >
            {item}{" "}
            <span className="rounded bg-black/5 px-1 tabular-nums">
              {item === "All"
                ? cameras.length
                : cameras.filter((camera) => camera.zone === item).length}
            </span>
          </button>
        ))}
      </div>
      <div className="flex min-w-0 flex-auto flex-wrap items-center gap-2 min-[1650px]:flex-initial">
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
            className={field + " w-full pl-8 text-xs"}
          />
        </label>
        <select
          aria-label="Sort cameras"
          value={sort}
          onChange={(e) => setSort(e.target.value as CameraSort)}
          className={field + " text-xs"}
        >
          <option>Severity</option>
          <option>Name</option>
          <option>Count</option>
        </select>
        <div
          role="group"
          aria-label="Grid columns"
          className="hidden items-center rounded-lg border border-border bg-muted/50 p-0.5 md:flex"
        >
          <Columns2 size={14} className="mx-1.5 text-muted-foreground" />
          {([2, 3, 4] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-label={value + " columns"}
              aria-pressed={value === size}
              onClick={() => setSize(value)}
              className="size-7 rounded text-xs font-semibold aria-pressed:bg-white aria-pressed:text-secondary aria-pressed:shadow-sm"
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CameraGrid({
  cameras,
  size,
  now,
  loading,
  highlight,
  flashed,
  onOpen,
}: {
  cameras: Camera[];
  size: GridSize;
  now: number;
  loading: boolean;
  highlight: string | null;
  flashed: { id: string; key: number } | null;
  onOpen: (id: string, playback?: boolean) => void;
}) {
  return (
    <section aria-label="Camera grid" aria-busy={loading} data-columns={size} className="cctv-grid">
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
