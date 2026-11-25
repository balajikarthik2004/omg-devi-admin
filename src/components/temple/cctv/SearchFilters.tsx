import sampleTargetImg from "@/assets/cctv_target_person.jpg";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ZONES, type Camera, type Description } from "@/lib/cctv-service";
import { field, muted } from "./presentation";

export function UploadPanel({
  photo,
  setPhoto,
  active,
}: {
  photo: File | null;
  setPhoto: (file: File | null) => void;
  active: boolean;
}) {
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!photo) return;
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  const selectFile = useCallback(
    (file?: File) => {
      if (!file) return;
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Choose a JPG, PNG, or WebP image.");
      } else if (file.size < 1 || file.size > 10 * 1024 * 1024) {
        setError("The image must be between 1 byte and 10 MB.");
      } else {
        setError("");
        setPhoto(file);
      }
    },
    [setPhoto],
  );
  useEffect(() => {
    if (!active) return;
    function paste(event: ClipboardEvent) {
      const file = Array.from(event.clipboardData?.files ?? []).find((item) =>
        item.type.startsWith("image/"),
      );
      if (file) {
        event.preventDefault();
        selectFile(file);
      }
    }
    window.addEventListener("paste", paste);
    return () => window.removeEventListener("paste", paste);
  }, [active, selectFile]);
  return (
    <div
      className="space-y-2"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        selectFile(event.dataTransfer.files[0]);
      }}
    >
      <input
        ref={input}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          selectFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {photo ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/35 p-3">
          <img
            src={preview || undefined}
            alt="Reference photo"
            onError={() => {
              setPhoto(null);
              setError("Unable to open this image. Choose another file.");
            }}
            className="size-16 rounded-md object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold" title={photo.name}>
              {photo.name}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => input.current?.click()}
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPhoto(null);
                  setError("");
                }}
              >
                <X /> Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => input.current?.click()}
            className={
              "flex w-full flex-col items-center gap-1 rounded-xl border border-dashed p-4 text-center " +
              (dragging
                ? "border-secondary bg-secondary-tint"
                : "border-secondary/35 bg-secondary-tint/40 hover:bg-secondary-tint")
            }
          >
            <ImagePlus size={22} className="mb-1 text-secondary" />
            <span className="flex items-center gap-1.5 text-xs font-bold text-secondary">
              <Upload size={13} /> Upload reference photo
            </span>
            <span className={muted}>Drop or paste an image</span>
            <span className="text-[10px] text-muted-foreground">JPG, PNG, WebP · Up to 10 MB</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch(sampleTargetImg);
                const blob = await res.blob();
                const file = new File([blob], "target_person_traditional_dhoti.jpg", { type: "image/jpeg" });
                setPhoto(file);
              } catch (e) {
                console.error(e);
              }
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-secondary/30 bg-white px-3 py-2 text-xs font-bold text-secondary hover:bg-secondary-tint/50 shadow-xs transition-all cursor-pointer"
          >
            <img src={sampleTargetImg} alt="" className="size-6 rounded-md object-cover border border-secondary/20" />
            <span>Load Reference Subject (Devotee in Silk Dhoti & Shirt)</span>
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-xs font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

const colors = [
  "Black",
  "White",
  "Gray",
  "Red",
  "Orange",
  "Yellow",
  "Green",
  "Blue",
  "Purple",
  "Pink",
  "Brown",
  "Multicolor",
];
export function DescriptionSearch({
  value,
  setValue,
}: {
  value: Description;
  setValue: (value: Description) => void;
}) {
  const inputs = [
    { key: "gender", label: "Gender", options: ["Female", "Male", "Other"] },
    {
      key: "age",
      label: "Approx. age",
      options: ["0–5", "6–12", "13–17", "18–35", "36–59", "60+"],
    },
    { key: "top", label: "Top color", options: colors },
    { key: "bottom", label: "Bottom color", options: colors },
  ] as const;
  return (
    <div className="grid grid-cols-2 gap-2">
      {inputs.map(({ key, label, options }) => (
        <label key={key} className="grid min-w-0 gap-1 text-xs font-semibold">
          {label}
          <select
            className={field + " w-full"}
            value={value[key]}
            onChange={(event) => setValue({ ...value, [key]: event.target.value })}
          >
            <option value="">Any</option>
            {options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      ))}
      <label className="col-span-2 flex items-center gap-2 py-1 text-xs font-semibold">
        <input
          type="checkbox"
          role="switch"
          checked={value.bag}
          onChange={(event) => setValue({ ...value, bag: event.target.checked })}
          className="size-4 accent-secondary"
        />
        Carrying a bag
      </label>
      <button
        type="button"
        onClick={() =>
          setValue({
            gender: "Male",
            age: "18–35",
            top: "Blue",
            bottom: "Black",
            bag: false,
          })
        }
        className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl border border-secondary/30 bg-white px-2.5 py-2 text-xs font-bold text-secondary hover:bg-secondary-tint/50 shadow-xs transition-colors cursor-pointer"
      >
        <span>Fill Preset: Man in Navy Blazer & White Shirt</span>
      </button>
    </div>
  );
}

export type ScopeFields = {
  time: string;
  from: string;
  to: string;
  confidence: number;
  excluded: string[];
};
export function ScopeFilters({
  cameras,
  value,
  setValue,
}: {
  cameras: Camera[];
  value: ScopeFields;
  setValue: (value: ScopeFields) => void;
}) {
  const selected = cameras.filter((camera) => !value.excluded.includes(camera.id));
  function toggle(id: string) {
    setValue({
      ...value,
      excluded: value.excluded.includes(id)
        ? value.excluded.filter((item) => item !== id)
        : [...value.excluded, id],
    });
  }
  return (
    <fieldset className="grid min-w-0 gap-3 border-t border-border pt-3">
      <legend className="pr-2 text-sm font-extrabold">Scan scope</legend>
      <details className="rounded-lg border border-border bg-card">
        <summary className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold">
          Cameras{" "}
          <span className={"ml-1 " + muted}>
            {selected.length} / {cameras.length} selected
          </span>
        </summary>
        <div className="max-h-60 space-y-2 overflow-y-auto border-t border-border p-2">
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setValue({ ...value, excluded: [] })}
            >
              Select all
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setValue({ ...value, excluded: cameras.map((camera) => camera.id) })}
            >
              Clear
            </Button>
          </div>
          {ZONES.map((zone) => (
            <fieldset key={zone} className="grid gap-1 rounded-md bg-muted/50 px-2 pb-2">
              <legend className="text-xs font-bold text-secondary">{zone}</legend>
              {cameras
                .filter((camera) => camera.zone === zone)
                .map((camera) => (
                  <label key={camera.id} className="flex items-start gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      className="mt-0.5 shrink-0 accent-secondary"
                      checked={!value.excluded.includes(camera.id)}
                      onChange={() => toggle(camera.id)}
                    />
                    <span>
                      {camera.id} · {camera.name}
                    </span>
                  </label>
                ))}
            </fieldset>
          ))}
        </div>
      </details>
      <label className="grid gap-1 text-xs font-semibold">
        Time range
        <select
          className={field}
          value={value.time}
          onChange={(event) => setValue({ ...value, time: event.target.value })}
        >
          <option value="1">Last 1h</option>
          <option value="6">Last 6h</option>
          <option value="24">Last 24h</option>
          <option value="custom">Custom</option>
        </select>
      </label>
      {value.time === "custom" && (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="grid min-w-0 gap-1 text-xs font-semibold">
            From
            <input
              required
              type="datetime-local"
              className={field + " w-full"}
              value={value.from}
              onChange={(event) => setValue({ ...value, from: event.target.value })}
            />
          </label>
          <label className="grid min-w-0 gap-1 text-xs font-semibold">
            To
            <input
              required
              type="datetime-local"
              className={field + " w-full"}
              value={value.to}
              onChange={(event) => setValue({ ...value, to: event.target.value })}
            />
          </label>
        </div>
      )}
      <label className="grid gap-1.5 text-xs font-semibold">
        <span className="flex justify-between">
          Confidence threshold <strong className="text-secondary">{value.confidence}%</strong>
        </span>
        <input
          type="range"
          min={50}
          max={100}
          value={value.confidence}
          onChange={(event) => setValue({ ...value, confidence: Number(event.target.value) })}
          className="w-full accent-secondary"
        />
      </label>
    </fieldset>
  );
}
