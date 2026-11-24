import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Hourglass,
  PackageSearch,
  ShieldAlert,
  VideoOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { acknowledgeAlert, type Camera, type CctvAlert } from "@/lib/cctv-service";
import { absoluteTime, panel, relativeTime, statusStyle } from "./presentation";

export type AlertFilter = "Active" | "Acknowledged" | "All";
const icons = {
  "crowd surge": Hourglass,
  overcrowding: AlertTriangle,
  "unattended object": PackageSearch,
  "restricted area": ShieldAlert,
  "camera offline": VideoOff,
};

function AlertCard({
  alert,
  camera,
  now,
  onView,
  onHighlight,
}: {
  alert: CctvAlert;
  camera?: Camera;
  now: number;
  onView: (id: string) => void;
  onHighlight: (id: string | null) => void;
}) {
  const Icon = icons[alert.type];
  async function acknowledge() {
    try {
      await acknowledgeAlert(alert.id);
      onHighlight(null);
    } catch {
      toast.error("Unable to acknowledge this alert");
    }
  }
  return (
    <article
      className={
        "rounded-lg border border-l-[3px] bg-card p-3 " +
        (alert.severity === "high"
          ? "border-border border-l-primary"
          : "border-border border-l-status-busy")
      }
      onMouseEnter={() => onHighlight(alert.cameraId)}
      onMouseLeave={() => onHighlight(null)}
      onFocus={() => onHighlight(alert.cameraId)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onHighlight(null);
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold capitalize">
          <Icon
            size={15}
            className={alert.severity === "high" ? "text-primary" : "text-amber-700"}
          />{" "}
          {alert.type}
        </div>
        <time
          title={absoluteTime(alert.timestamp)}
          dateTime={new Date(alert.timestamp).toISOString()}
          className="shrink-0 text-[10px] tabular-nums text-muted-foreground"
        >
          {relativeTime(alert.timestamp, now)}
        </time>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold text-muted-foreground">
        <span>
          {alert.cameraId} · {camera?.zone}
        </span>
        {camera && (
          <span
            className={
              "rounded px-1.5 py-0.5 font-bold uppercase " + statusStyle[camera.status].pill
            }
          >
            {camera.status}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs leading-relaxed">{alert.message}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => onView(alert.cameraId)}>
          View camera
        </Button>
        {alert.acknowledged ? (
          <span className="text-[10px] font-semibold text-muted-foreground">Acknowledged</span>
        ) : (
          <Button type="button" size="sm" variant="ghost" onClick={() => void acknowledge()}>
            Acknowledge
          </Button>
        )}
      </div>
    </article>
  );
}

export function AlertsPanel({
  alerts,
  cameras,
  now,
  filter,
  setFilter,
  loading,
  onView,
  onHighlight,
  inline,
}: {
  alerts: CctvAlert[];
  cameras: Camera[];
  now: number;
  filter: AlertFilter;
  setFilter: (filter: AlertFilter) => void;
  loading: boolean;
  onView: (id: string) => void;
  onHighlight: (id: string | null) => void;
  inline?: boolean;
}) {
  const active = alerts.filter((alert) => !alert.acknowledged).length;
  const visible = alerts.filter(
    (alert) => filter === "All" || alert.acknowledged === (filter === "Acknowledged"),
  );
  return (
    <section
      aria-label="Camera alerts"
      aria-busy={loading}
      className={
        inline ? panel + " flex max-h-[calc(100dvh-7rem)] flex-col" : "flex min-h-0 flex-col"
      }
    >
      <div className="shrink-0 space-y-3 p-4 pb-3">
        {inline && (
          <h2 className="flex items-center gap-2 text-base font-extrabold">
            <Bell size={17} className="text-primary" /> Alerts
          </h2>
        )}
        <div
          role="group"
          aria-label="Alert filters"
          className="flex flex-wrap gap-1 rounded-lg bg-muted p-1"
        >
          {(["Active", "Acknowledged", "All"] as const).map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={item === filter}
              onClick={() => setFilter(item)}
              className="flex-1 rounded-md px-2 py-1.5 text-xs font-semibold text-muted-foreground aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-sm"
            >
              {item}
              {item === "Active" ? " (" + active + ")" : ""}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 space-y-2 overflow-y-auto overscroll-contain px-4 pb-4">
        {loading ? (
          [1, 2, 3].map((key) => <Skeleton key={key} className="h-28" />)
        ) : visible.length ? (
          visible.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              camera={cameras.find((camera) => camera.id === alert.cameraId)}
              now={now}
              onView={onView}
              onHighlight={onHighlight}
            />
          ))
        ) : (
          <p className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-xs font-semibold text-muted-foreground">
            <CheckCircle2 size={17} className="shrink-0 text-emerald-700" />
            {filter === "Active"
              ? "All clear — no active alerts"
              : filter === "Acknowledged"
                ? "No acknowledged alerts"
                : "No alerts"}
          </p>
        )}
      </div>
    </section>
  );
}
