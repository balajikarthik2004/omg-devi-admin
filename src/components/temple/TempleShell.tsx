import { useState, useEffect, useRef } from "react";
import {
  CalendarDays,
  Sun,
  Home,
  Users,
  Flame,
  Video,
  Timer,
  UsersRound,
  Landmark,
  Car,
  Megaphone,
  BarChart3,
  Siren,
  Bell,
  LogOut,
  ChevronDown,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Store,
  IndianRupee,
  Utensils,
} from "lucide-react";
import { Toaster } from "sonner";
import { NAV_ITEMS, TEMPLE_DIRECTORY, type SectionId } from "@/lib/temple-data";
import { penangTemple } from "@/lib/penang-temple";
import { useLiveClock } from "@/lib/use-live";
import { useCctv } from "@/lib/use-cctv";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { DashboardSection } from "./sections/DashboardSection";
import { PenangTempleSection } from "./sections/PenangTempleSection";
import { PenangMapSection } from "./sections/PenangMapSection";
import { PenangStoreSection } from "./sections/PenangStoreSection";
import { HeatmapSection } from "./sections/HeatmapSection";
import { CctvPage } from "./sections/CCTVSection";
import { DarshanSection } from "./sections/DarshanSection";
import { QueueSection } from "./sections/QueueSection";
import { StaffSection } from "./sections/StaffSection";
import { OperationsSection } from "./sections/OperationsSection";
import { ParkingSection } from "./sections/ParkingSection";
import { DonationSection } from "./sections/DonationSection";
import { AnnadhanamSection } from "./sections/AnnadhanamSection";
import omgLogo from "@/assets/logo.png";
import sidebarArtwork from "@/assets/sidebar.png";
import "./temple-theme.css";

const ICONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Home,
  Users,
  Flame,
  Video,
  Timer,
  UsersRound,
  Landmark,
  MapPin,
  Store,
  Car,
  Megaphone,
  BarChart3,
  Siren,
  Ticket,
  IndianRupee,
  Utensils,
};

const SECTION_SUBTITLES: Partial<Record<SectionId, string>> = {
  heatmap: "Monitor crowd density, movement, and capacity across temple zones.",
  staff: "Coordinate volunteer assignments, shifts, and coverage.",
  operations: "Manage rituals, facilities, and daily temple operations.",
  darshan: "Track bookings, ticket categories, and darshan entry flow.",
  parking: "Monitor vehicle occupancy and parking availability.",
  donations: "Review collections and temple fund activity.",
  annadhanam: "Monitor meal service, queues, and kitchen readiness.",
};

const isPenangSection = (id: SectionId) => id === "map" || id === "store";
const desktopNavigationQuery = "(min-width: 768px)";

export function TempleShell() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [desktopNavigation, setDesktopNavigation] = useState(
    () => matchMedia(desktopNavigationQuery).matches,
  );
  const [sidebarExpanded, setSidebarExpanded] = useState(desktopNavigation);
  const mobileNavigationOpen = sidebarExpanded && !desktopNavigation;
  const sidebarToggle = useRef<HTMLButtonElement>(null);
  const dismissMobileNavigation = () => {
    setSidebarExpanded(false);
    sidebarToggle.current?.focus();
  };
  useEffect(() => {
    const media = matchMedia(desktopNavigationQuery);
    const update = () => {
      setDesktopNavigation(media.matches);
      setSidebarExpanded(media.matches);
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const [cctvAlertsOpen, setCctvAlertsOpen] = useState(false);
  const cctv = useCctv();
  const [section, setSection] = useState<SectionId>(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      return (NAV_ITEMS.find((n) => n.id === hash)?.id as SectionId) || "dashboard";
    }
    return "dashboard";
  });
  const [templeId, setTempleId] = useState<string>(() =>
    isPenangSection(section) ? penangTemple.id : "batu-caves-murugan",
  );
  useEffect(() => {
    function syncSection() {
      const hash = window.location.hash.slice(1);
      const next = NAV_ITEMS.find((item) => item.id === hash)?.id ?? "dashboard";
      if (isPenangSection(next)) setTempleId(penangTemple.id);
      setSection(next);
    }
    window.addEventListener("hashchange", syncSection);
    return () => window.removeEventListener("hashchange", syncSection);
  }, []);
  useEffect(() => {
    if (!window.location.hash) window.location.hash = "dashboard";
  }, []);
  const [templeOpen, setTempleOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<string>("All States");
  const [stateOpen, setStateOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All Districts");
  const [districtOpen, setDistrictOpen] = useState(false);
  const [shimmer, setShimmer] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const temple = TEMPLE_DIRECTORY.find((t) => t.id === templeId) ?? TEMPLE_DIRECTORY[0];
  const isPenang = temple.id === "penang-balathandayuthapani";
  const cameraAlertCount = cctv.activeCount;

  const otherStates = Array.from(new Set(TEMPLE_DIRECTORY.map((t) => t.state)))
    .filter((s) => s !== "Tamil Nadu")
    .sort();
  const states = ["All States", "Tamil Nadu", ...otherStates];

  const filteredByState =
    selectedState === "All States" ? TEMPLE_DIRECTORY : TEMPLE_DIRECTORY.filter((t) => t.state === selectedState);

  const districts = [
    "All Districts",
    ...Array.from(new Set(filteredByState.map((t) => t.district))),
  ].sort();
  const now = useLiveClock();
  const switchTemple = (id: string) => {
    setShimmer(true);
    setTempleId(id);
    if (id !== "penang-balathandayuthapani" && isPenangSection(section)) {
      window.location.hash = "dashboard";
      setSection("dashboard");
    }
    setTempleOpen(false);
    setTimeout(() => setShimmer(false), 1000);
  };
  const isCctv = section === "cctv";
  const currentSection = NAV_ITEMS.find((item) => item.id === section);
  const SectionIcon = currentSection ? ICONS[currentSection.icon] : undefined;
  const subtitle = SECTION_SUBTITLES[section];

  return (
    <div
      className="temple-admin relative min-h-dvh overflow-clip"
      data-section={section}
      data-nav-expanded={sidebarExpanded}
      data-mobile-nav-open={mobileNavigationOpen}
    >
      <div className="relative z-10 flex min-h-dvh">
        <Toaster position="top-right" richColors theme="light" />

        {mobileNavigationOpen && (
          <button
            type="button"
            aria-label="Dismiss navigation"
            tabIndex={-1}
            onClick={dismissMobileNavigation}
            className="temple-nav-backdrop fixed inset-y-0 right-0 z-30 bg-primary/50"
          />
        )}

        <aside
          id="temple-admin-sidebar"
          className="temple-sidebar fixed top-0 left-0 z-40 flex shrink-0 flex-col self-start border-r border-white/10 text-white select-none md:sticky"
          onKeyDown={(event) => {
            if (event.key === "Escape" && mobileNavigationOpen) dismissMobileNavigation();
          }}
        >
          {/* Logo row */}
          <div
            className={`flex shrink-0 items-center gap-2 ${
              sidebarExpanded ? "justify-between p-4" : "flex-col px-2 pt-4 pb-2"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.25)] p-1.5 transition-transform duration-300 hover:scale-105">
                <img
                  src={omgLogo}
                  alt="OMG Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              {sidebarExpanded && (
                <div className="min-w-0 flex-1 overflow-hidden select-none animate-in fade-in duration-200">
                  <div className="font-bold text-lg text-white leading-tight tracking-wider">
                    OMG
                  </div>
                  <div className="text-[10px] font-semibold text-[#b8d6c7] tracking-[0.2em] uppercase mt-0.5">
                    Admin Portal
                  </div>
                </div>
              )}
            </div>

            {/* Collapse toggle */}
            <button
              ref={sidebarToggle}
              type="button"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              aria-label={sidebarExpanded ? "Collapse navigation" : "Expand navigation"}
              aria-expanded={sidebarExpanded}
              aria-controls="temple-admin-sidebar"
              className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              {sidebarExpanded ? (
                <ChevronLeft size={14} strokeWidth={2.5} />
              ) : (
                <ChevronRight size={14} strokeWidth={2.5} />
              )}
            </button>
          </div>

          {/* Nav items */}
          <nav
            aria-label="Admin navigation"
            className={`temple-nav relative min-h-0 flex-1 overflow-y-auto overscroll-contain ${
              sidebarExpanded ? "px-3" : "px-2"
            } py-2 space-y-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none`}
          >
            {NAV_ITEMS.filter((item) => !isPenangSection(item.id) || isPenang).map((item) => {
              const Icon = ICONS[item.icon];
              const active = item.id === section;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    window.location.hash = item.id;
                    setSection(item.id);
                    setBellOpen(false);
                    setCctvAlertsOpen(false);
                    if (mobileNavigationOpen) setSidebarExpanded(false);
                  }}
                  aria-label={
                    item.label +
                    (item.id === "cctv" && cameraAlertCount
                      ? `, ${cameraAlertCount} active alerts`
                      : "")
                  }
                  aria-current={active ? "page" : undefined}
                  data-section={item.id}
                  className={`group relative flex w-full items-center ${
                    sidebarExpanded ? "h-[42px] px-3 gap-3" : "h-[42px] justify-center px-1"
                  } rounded-2xl text-[13.5px] transition-all duration-200 cursor-pointer border ${
                    active
                      ? "bg-gradient-to-r from-[#d48b1d] via-[#e59d24] to-[#c4770d] text-white font-semibold border-amber-400/30 shadow-[0_4px_16px_rgba(212,139,29,0.35)]"
                      : "border-transparent text-white/80 hover:text-white hover:bg-white/[0.08]"
                  }`}
                  title={item.label}
                >
                  {/* Icon container */}
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                      active
                        ? "text-white"
                        : "bg-white/[0.06] text-white/85 group-hover:bg-white/[0.12] group-hover:text-white"
                    }`}
                  >
                    <Icon size={17} strokeWidth={2} className="shrink-0" />
                  </div>

                  {/* Label */}
                  {sidebarExpanded && (
                    <span className="truncate text-left flex-1 tracking-wide">
                      {item.label}
                    </span>
                  )}

                  {/* CCTV Alert Badge */}
                  {item.id === "cctv" && cameraAlertCount > 0 && (
                    <span
                      className={`${
                        sidebarExpanded ? "ml-auto" : "absolute -top-1 -right-1"
                      } flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e03131] px-1 text-[11px] font-bold text-white shadow-sm ring-2 ring-[#072a1e]`}
                    >
                      {cameraAlertCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Area: Temple Artwork + Floating Frosted User Profile & Logout */}
          <div className="relative mt-auto shrink-0 flex flex-col justify-end w-full">
            {/* Temple Artwork */}
            {sidebarExpanded && (
              <div className="relative w-full h-44 -mb-28 overflow-hidden select-none pointer-events-none">
                {/* Top gradient fade into the deep green sidebar */}
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#072a1e] via-[#072a1e]/80 to-transparent z-10" />
                <img
                  src={sidebarArtwork}
                  alt="Temple Gopuram"
                  className="w-full h-full object-cover object-center"
                />
                {/* Bottom subtle gradient */}
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#06241a] to-transparent z-10" />
              </div>
            )}

            {/* Frosted Glass Profile Card */}
            <div className={`relative z-20 ${sidebarExpanded ? "px-3 pb-3 pt-2" : "px-1.5 pb-3 pt-2"}`}>
              {sidebarExpanded ? (
                <div className="rounded-2xl backdrop-blur-md bg-[#0a3627]/75 border border-white/20 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all">
                  {/* User info row */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#d48b1d] to-[#aa6609] text-base font-bold text-white shadow-inner">
                      A
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-white leading-tight">
                        Santhosh Kumar
                      </div>
                      <div className="truncate text-xs font-medium text-white/60 leading-tight mt-0.5">
                        Admin
                      </div>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    type="button"
                    aria-label="Logout"
                    title="Logout"
                    onClick={() => {
                      auth.logout();
                      navigate({ to: "/login" });
                    }}
                    className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/15 hover:border-white/25 py-2 px-3 text-xs font-semibold text-white/90 hover:text-white transition-all cursor-pointer shadow-sm group"
                  >
                    <LogOut
                      size={16}
                      strokeWidth={2}
                      className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
                    />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 rounded-2xl backdrop-blur-md bg-[#0a3627]/80 border border-white/20 p-1.5 shadow-lg">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#d48b1d] to-[#aa6609] text-sm font-bold text-white shadow-inner"
                    title="Santhosh Kumar (Admin)"
                  >
                    A
                  </div>
                  <button
                    type="button"
                    aria-label="Logout"
                    title="Logout"
                    onClick={() => {
                      auth.logout();
                      navigate({ to: "/login" });
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/15 text-white/90 hover:text-white transition-all cursor-pointer"
                  >
                    <LogOut size={16} strokeWidth={2} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* =============================
        TOPBAR
        ============================= */}
        <header
          inert={mobileNavigationOpen}
          className="temple-topbar fixed top-0 right-0 z-20 flex items-center justify-between border-b shadow-sm"
        >
          <div className="temple-topbar-group temple-topbar-selectors flex items-center gap-4">
            <div className="temple-topbar-live hidden sm:flex items-center gap-2 rounded-full px-3 py-1 text-[9px] font-bold tracking-wide bg-status-normal/10 border border-status-normal/20 text-status-normal shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-status-normal animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              LIVE
            </div>

            {/* State filter */}
            <div className="temple-topbar-filter relative hidden lg:block">
              <button
                aria-expanded={stateOpen}
                onClick={() => {
                  setStateOpen((o) => !o);
                  setDistrictOpen(false);
                  setTempleOpen(false);
                  setBellOpen(false);
                }}
                className="group flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md bg-white border border-border/60 text-foreground"
              >
                <Sparkles size={14} className="text-primary" />
                <span className="tracking-wide">{selectedState}</span>
                <ChevronDown
                  size={14}
                  className="text-muted-foreground transition-transform duration-300 group-hover:translate-y-0.5"
                />
              </button>
              {stateOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl shadow-xl max-h-[60vh] overflow-y-auto bg-white border border-border/50">
                  {states.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSelectedState(s);
                        setStateOpen(false);
                        setSelectedDistrict("All Districts");
                        const firstTemple =
                          s === "All States" ? TEMPLE_DIRECTORY[0] : TEMPLE_DIRECTORY.find((t) => t.state === s);
                        if (firstTemple && temple?.state !== s) {
                          switchTemple(firstTemple.id);
                        }
                      }}
                      className={`flex w-full items-center px-4 py-3 text-left text-xs transition-colors hover:bg-muted/50 ${s === selectedState ? "bg-muted/50 font-bold text-foreground" : "font-medium text-foreground"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* District filter */}
            <div className="temple-topbar-filter relative hidden lg:block">
              <button
                aria-expanded={districtOpen}
                onClick={() => {
                  setDistrictOpen((o) => !o);
                  setStateOpen(false);
                  setTempleOpen(false);
                  setBellOpen(false);
                }}
                className="group flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md bg-white border border-border/60 text-foreground"
              >
                <MapPin size={14} className="text-primary" />
                <span className="tracking-wide">{selectedDistrict}</span>
                <ChevronDown
                  size={14}
                  className="text-muted-foreground transition-transform duration-300 group-hover:translate-y-0.5"
                />
              </button>
              {districtOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl shadow-xl max-h-[60vh] overflow-y-auto bg-white border border-border/50">
                  {districts.map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setSelectedDistrict(d);
                        setDistrictOpen(false);
                        const firstTemple =
                          d === "All Districts"
                            ? filteredByState[0]
                            : filteredByState.find((t) => t.district === d);
                        if (firstTemple && d !== "All Districts" && temple?.district !== d) {
                          switchTemple(firstTemple.id);
                        }
                      }}
                      className={`flex w-full items-center px-4 py-3 text-left text-xs transition-colors hover:bg-muted/50 ${d === selectedDistrict ? "bg-muted/50 font-bold text-foreground" : "font-medium text-foreground"}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Temple switcher */}
            <div className="temple-topbar-filter temple-topbar-temple relative">
              <button
                aria-expanded={templeOpen}
                aria-label={temple ? "Select temple, current " + temple.name : "Select temple"}
                onClick={() => {
                  setTempleOpen((o) => !o);
                  setDistrictOpen(false);
                  setStateOpen(false);
                  setBellOpen(false);
                }}
                className="group flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md bg-white border border-border/60 text-foreground"
              >
                <Landmark size={14} className="text-primary" />
                <span className="hidden sm:block tracking-wide">
                  {temple?.name || "Select Temple"}
                </span>
                <ChevronDown
                  size={14}
                  className="text-muted-foreground transition-transform duration-300 group-hover:translate-y-0.5"
                />
              </button>
              {templeOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl shadow-xl max-h-[60vh] overflow-y-auto bg-white border border-border/50">
                  {filteredByState
                    .filter(
                      (t) =>
                        selectedDistrict === "All Districts" || t.district === selectedDistrict,
                    )
                    .map((t) => (
                      <button
                        key={t.id}
                        onClick={() => switchTemple(t.id)}
                        className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50 ${t.id === templeId ? "bg-muted/50 font-bold text-foreground" : "font-medium text-foreground"}`}
                      >
                        <span className="text-xs">{t.name}</span>
                        <span className="text-[9px] font-semibold tracking-wider text-muted-foreground">
                          {t.short}
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="temple-topbar-group flex items-center gap-4">
            {/* Empty space that was replaced by moving filters */}

            {/* Clock + weather */}
            <div className="temple-topbar-clock hidden xl:flex items-center gap-2 text-xs ml-2">
              <CalendarDays size={17} aria-hidden="true" />
              <div
                className={
                  isCctv ? "flex flex-col-reverse leading-tight" : "flex items-center gap-1.5"
                }
              >
                <span className="font-mono font-semibold tracking-tight text-foreground">
                  {now.toLocaleTimeString("en-IN", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: temple?.state === "Malaysia" ? "Asia/Kuala_Lumpur" : undefined,
                  })}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {now.toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    timeZone: temple?.state === "Malaysia" ? "Asia/Kuala_Lumpur" : undefined,
                  })}
                </span>
              </div>
            </div>

            {/* Weather */}
            {temple?.weather && (
              <div className="temple-topbar-weather hidden min-[1150px]:flex items-center gap-2 rounded-full px-4 py-2 bg-white border border-border/60 shadow-sm ml-2">
                <span className="text-[9px] font-semibold tracking-wider text-muted-foreground">
                  {temple.short}
                </span>
                <span className="text-xs font-bold text-foreground">{temple.weather}</span>
                <Sun size={16} aria-hidden="true" />
              </div>
            )}

            {/* Bell */}
            <div className="relative ml-1">
              <button
                aria-label={`Notifications, ${cctv.activeCount} active camera alerts`}
                title="Notifications"
                onClick={() => {
                  if (isCctv) setCctvAlertsOpen(true);
                  else setBellOpen((o) => !o);
                  setDistrictOpen(false);
                  setStateOpen(false);
                  setTempleOpen(false);
                }}
                className="relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-white hover:shadow-sm border border-transparent hover:border-border/60"
              >
                <Bell
                  size={20}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                />
                {cctv.activeCount > 0 && (
                  <span className="temple-alert-badge absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full text-[8px] font-bold text-white bg-primary shadow-sm border border-white">
                    {cctv.activeCount}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl shadow-xl bg-white border border-border/50">
                  <div className="px-5 py-3 text-[11px] font-bold tracking-tight bg-muted/40 border-b border-border/50 text-foreground">
                    Notifications
                  </div>
                  {[
                    {
                      t: "Peak alert",
                      b: "Inner sanctum approaching capacity",
                      c: "var(--color-primary)",
                      dot: "var(--color-primary)",
                    },
                    {
                      t: "Queue update",
                      b: "Lane B wait time +6 min",
                      c: "var(--color-status-busy)",
                      dot: "var(--color-status-busy)",
                    },
                    {
                      t: "Staff",
                      b: "8 volunteers Added to Lane C",
                      c: "var(--color-secondary)",
                      dot: "var(--color-secondary)",
                    },
                  ].map((n, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 px-5 py-4 text-sm hover:bg-muted/40 transition-colors border-b border-border/30 last:border-0"
                    >
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full shadow-sm"
                        style={{ background: n.dot }}
                      />
                      <div>
                        <div className="font-bold text-xs tracking-tight" style={{ color: n.c }}>
                          {n.t}
                        </div>
                        <div className="text-muted-foreground mt-1 text-[10px] leading-relaxed">
                          {n.b}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="temple-topbar-avatar grid h-10 w-10 place-items-center rounded-full text-xs font-bold text-white cursor-pointer transition-all duration-300 hover:scale-105 bg-[#1A1F60] shadow-sm ml-1 border border-white/20">
              A
            </div>
          </div>
        </header>

        <main inert={mobileNavigationOpen} className="temple-content min-h-dvh min-w-0 flex-1">
          <div className="temple-content-inner relative mx-auto min-h-[calc(100dvh-4rem)] w-full max-w-[1600px] px-3 py-5 sm:p-6 lg:p-8">
            {/* Temple switch shimmer */}
            {shimmer && (
              <div
                className={`temple-switch-loading fixed right-0 bottom-0 z-[25] flex items-center justify-center backdrop-blur-md animate-in fade-in duration-200 bg-background/70`}
              >
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-red-500/5 backdrop-blur-xl shadow-[0_0_50px_rgba(239,68,68,0.15)] transform scale-110">
                  <span className="text-7xl font-montserrat text-primary/15 relative z-10">ॐ</span>
                  <div
                    className="absolute inset-0 flex items-center justify-center animate-fill-up z-20"
                    style={{ animationDuration: "0.5s" }}
                  >
                    <span className="text-7xl font-montserrat text-primary drop-shadow-xl">ॐ</span>
                  </div>
                </div>
              </div>
            )}

            <div
              className={`temple-workspace transition-all duration-200 ${shimmer ? "opacity-30 blur-[2px] pointer-events-none translate-y-2" : "opacity-100 translate-y-0 blur-none"}`}
            >
              {currentSection && SectionIcon && subtitle && (
                <div className="temple-page-heading">
                  <span className="temple-page-icon" aria-hidden="true">
                    <SectionIcon size={21} />
                  </span>
                  <div>
                    <h1 className="text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">
                      {currentSection.label}
                    </h1>
                    <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                      {subtitle}
                    </p>
                  </div>
                </div>
              )}
              {section === "dashboard" && <DashboardSection temple={temple} />}
              {section === "heatmap" && <HeatmapSection temple={temple} />}
              {section === "map" && <PenangMapSection />}
              {section === "store" && <PenangStoreSection />}
              {section === "cctv" && (
                <CctvPage
                  data={cctv}
                  now={now.getTime()}
                  user={auth.user ?? "Admin"}
                  alertsOpen={cctvAlertsOpen}
                  onAlertsOpenChange={setCctvAlertsOpen}
                />
              )}
              {section === "darshan" && <DarshanSection />}
              {(section as string) === "queue" && <QueueSection />}
              {section === "staff" && <StaffSection />}
              {section === "operations" && <OperationsSection />}
              {section === "parking" && <ParkingSection />}
              {section === "donations" && <DonationSection />}
              {section === "annadhanam" && <AnnadhanamSection temple={temple} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
