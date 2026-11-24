import { useState, useEffect } from "react";
import {
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
  IndianRupee,
  Utensils,
} from "lucide-react";
import { Toaster } from "sonner";
import { NAV_ITEMS, TEMPLES, type SectionId } from "@/lib/temple-data";
import { useLiveClock } from "@/lib/use-live";
import { useCctv } from "@/lib/use-cctv";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { DashboardSection } from "./sections/DashboardSection";
import { HeatmapSection } from "./sections/HeatmapSection";
import { CctvPage } from "./sections/CCTVSection";
import { DarshanSection } from "./sections/DarshanSection";
import { QueueSection } from "./sections/QueueSection";
import { StaffSection } from "./sections/StaffSection";
import { OperationsSection } from "./sections/OperationsSection";
import { ParkingSection } from "./sections/ParkingSection";
import { AnnouncementsSection } from "./sections/AnnouncementsSection";
import { AnalyticsSection } from "./sections/AnalyticsSection";
import { EmergencySection } from "./sections/EmergencySection";
import { DonationSection } from "./sections/DonationSection";
import { AnnadhanamSection } from "./sections/AnnadhanamSection";
import omgLogo from "@/assets/logo.png";

const ICONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
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
  Ticket,
  IndianRupee,
  Utensils,
};

export function TempleShell() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(
    () => matchMedia("(min-width: 768px)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(min-width: 768px)");
    const update = () => setSidebarExpanded(media.matches);
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
  useEffect(() => {
<<<<<<< HEAD
    function syncSection() {
      const hash = window.location.hash.slice(1);
      setSection(NAV_ITEMS.find((item) => item.id === hash)?.id ?? "dashboard");
    }
    window.addEventListener("hashchange", syncSection);
    return () => window.removeEventListener("hashchange", syncSection);
  }, []);
  useEffect(() => {
    if (!window.location.hash) window.location.hash = "dashboard";
  }, []);
  const [templeId, setTempleId] = useState<string | null>("palani-murugan");
=======
    window.location.hash = section;
  }, [section]);
  const [templeId, setTempleId] = useState<string | null>("tiruvannamalai");
>>>>>>> fdd6855715257b11d5242fc9ae3c6e710aa57b41
  const [templeOpen, setTempleOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<string>("All States");
  const [stateOpen, setStateOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All Districts");
  const [districtOpen, setDistrictOpen] = useState(false);
  const [shimmer, setShimmer] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const temple = templeId ? TEMPLES.find((t) => t.id === templeId) : undefined;

  const otherStates = Array.from(new Set(TEMPLES.map((t) => t.state)))
    .filter((s) => s !== "Tamil Nadu")
    .sort();
  const states = ["All States", "Tamil Nadu", ...otherStates];

  const filteredByState =
    selectedState === "All States" ? TEMPLES : TEMPLES.filter((t) => t.state === selectedState);

  const districts = [
    "All Districts",
    ...Array.from(new Set(filteredByState.map((t) => t.district))),
  ].sort();
  const now = useLiveClock();
  const switchTemple = (id: string) => {
    setShimmer(true);
    setTempleId(id);
    setTempleOpen(false);
    setTimeout(() => setShimmer(false), 1000);
  };
  const sectionTitle = NAV_ITEMS.find((n) => n.id === section)?.label ?? "";

  return (
    <div className="min-h-dvh relative overflow-clip bg-background selection:bg-primary/30">
      {/* -- Premium Mesh Background -- */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-secondary-tint)_0%,transparent_50%),radial-gradient(ellipse_at_bottom_left,var(--color-muted)_0%,transparent_50%)] opacity-70" />
      <div
        className="orb-1 absolute top-[-10%] left-[-10%] h-[60vw] w-[60vw] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(226,46,40,0.03) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="orb-2 absolute bottom-[-20%] right-[-10%] h-[50vw] w-[50vw] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(41,48,136,0.04) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

<<<<<<< HEAD
      <div className="relative z-10 flex min-h-dvh">
=======
      <div className="relative z-10 flex min-h-screen w-full max-w-full overflow-x-hidden">
>>>>>>> fdd6855715257b11d5242fc9ae3c6e710aa57b41
        <Toaster position="top-right" richColors theme="light" />

        {/* =============================
          SIDEBAR (OMG Official Premium Gradient — Matching Devotee)
          ============================= */}
        <aside
<<<<<<< HEAD
          className={`fixed left-0 top-0 z-30 flex h-screen h-dvh shrink-0 flex-col transition-[width] duration-300 md:sticky ${sidebarExpanded ? "w-[276px]" : "w-[56px] md:w-[80px]"}`}
=======
          className={`fixed left-0 top-0 z-30 flex h-screen flex-col text-white transition-[width] duration-300 ease-in-out shrink-0 will-change-[width] ${
            sidebarExpanded ? "w-[220px]" : "w-[72px]"
          }`}
>>>>>>> fdd6855715257b11d5242fc9ae3c6e710aa57b41
          style={{
            background: "linear-gradient(180deg, #131a72 0%, #1e2680 60%, #e32c26 100%)",
            boxShadow: "4px 0 30px rgba(0,0,0,0.18)",
          }}
        >
          {/* Ambient glow effect */}
          <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          <div className="absolute -top-[150px] -left-[150px] w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

          {/* Logo row */}
<<<<<<< HEAD
          <div
            className={`relative flex shrink-0 flex-col ${sidebarExpanded ? "px-5" : "px-1 md:px-4"} py-5 md:py-7`}
          >
            <div
              className={`flex items-center ${sidebarExpanded ? "gap-4" : "justify-center"} transition-all duration-300`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all duration-500 hover:scale-105 border border-white/80 bg-white relative overflow-hidden group">
=======
          <div className="border-b border-white/10 flex items-center h-20 px-4 relative z-10">
            <div className="flex items-center min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0 overflow-hidden bg-white p-0.5 ring-1 ring-white/20 transition-transform duration-300 hover:scale-105">
>>>>>>> fdd6855715257b11d5242fc9ae3c6e710aa57b41
                <img
                  src={omgLogo}
                  alt="OMG Logo"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div
                className={`ml-3.5 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                  sidebarExpanded
                    ? "max-w-[120px] opacity-100 translate-x-0"
                    : "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                }`}
              >
                <div className="font-serif font-bold text-lg text-white leading-tight tracking-wide">
                  OMG
                </div>
                <div className="text-xs text-white/60 leading-tight font-medium uppercase tracking-widest mt-0.5">
                  Admin
                </div>
              </div>
            </div>

            {/* Collapse toggle */}
            <button
              type="button"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
<<<<<<< HEAD
              aria-label={sidebarExpanded ? "Collapse navigation" : "Expand navigation"}
              aria-expanded={sidebarExpanded}
              className="absolute -right-3.5 top-10 flex h-7 w-7 items-center justify-center rounded-full z-40 transition-all duration-300 hover:scale-110 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] text-primary border border-border/10 hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)]"
=======
              aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
              className="absolute -right-3.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full z-40 transition-transform duration-300 hover:scale-110 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] text-[#1e2680] border border-white/20 hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] cursor-pointer"
>>>>>>> fdd6855715257b11d5242fc9ae3c6e710aa57b41
            >
              {sidebarExpanded ? (
                <ChevronLeft size={14} strokeWidth={2.5} />
              ) : (
                <ChevronRight size={14} strokeWidth={2.5} />
              )}
            </button>
          </div>

          {/* Nav items */}
<<<<<<< HEAD
          <nav className="relative min-h-0 flex-1 overflow-y-auto px-1 py-4 md:px-4 md:py-6 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
=======
          <nav className="relative flex-1 overflow-y-auto py-4 space-y-1.5 px-3 z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
>>>>>>> fdd6855715257b11d5242fc9ae3c6e710aa57b41
            {NAV_ITEMS.map((item) => {
              const Icon = ICONS[item.icon];
              const active = item.id === section;
              return (
                <button
                  key={item.id}
<<<<<<< HEAD
                  onClick={() => {
                    window.location.hash = item.id;
                    setSection(item.id);
                    setBellOpen(false);
                    setCctvAlertsOpen(false);
                    if (!matchMedia("(min-width: 768px)").matches) setSidebarExpanded(false);
                  }}
                  aria-label={
                    item.label +
                    (item.id === "cctv" && cctv.activeCount
                      ? `, ${cctv.activeCount} active alerts`
                      : "")
                  }
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex w-full items-center ${sidebarExpanded ? "p-1.5 pr-4" : "p-1.5 justify-center"} rounded-2xl text-[14px] transition-all duration-400 border ${
                    active
                      ? "bg-white/10 backdrop-blur-xl border-white/20 border-t-white/30 border-l-white/30 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                      : "border-transparent text-indigo-100/70 hover:bg-white/[0.06] hover:text-white"
                  }`}
                  title={item.label}
=======
                  onClick={() => setSection(item.id)}
                  title={!sidebarExpanded ? item.label : undefined}
                  className={`group relative flex items-center w-full h-11 px-3 rounded-xl text-[15px] font-semibold transition-colors duration-200 text-left overflow-hidden cursor-pointer ${
                    active
                      ? "bg-white/20 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md ring-1 ring-white/30"
                      : "text-white/70 hover:bg-white/10 hover:text-white hover:shadow-md hover:ring-1 hover:ring-white/10"
                  }`}
>>>>>>> fdd6855715257b11d5242fc9ae3c6e710aa57b41
                >
                  {/* Left Indicator for Active State */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-white to-white/60 rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                  )}

<<<<<<< HEAD
                  {/* Icon Container */}
                  <div
                    className={`flex items-center justify-center shrink-0 h-8 w-8 md:h-[42px] md:w-[42px] rounded-[14px] transition-colors duration-400 ${
                      active
                        ? `bg-white/15 shadow-inner ${sidebarExpanded ? "ml-3" : ""}`
                        : "bg-white/5 group-hover:bg-white/10"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        active
                          ? "text-white drop-shadow-md"
                          : "text-indigo-200 group-hover:text-white transition-colors duration-400"
                      }
=======
                  {/* Icon */}
                  <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        active ? "scale-110 text-white drop-shadow-md" : "group-hover:scale-110 group-hover:text-white"
                      }`}
>>>>>>> fdd6855715257b11d5242fc9ae3c6e710aa57b41
                    />
                  </div>

                  {/* Label */}
<<<<<<< HEAD
                  {sidebarExpanded && (
                    <span
                      className={`ml-3 min-w-0 truncate transition-all duration-400 ${
                        active ? "font-bold tracking-wide" : "font-semibold tracking-wide"
                      }`}
                    >
                      {item.label}
                    </span>
                  )}

                  {/* Right Dot for Active State */}
                  {item.id === "cctv" && cctv.activeCount > 0 && (
                    <span
                      className={`${sidebarExpanded ? "ml-auto" : "absolute right-0 top-0"} grid min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white`}
                    >
                      {cctv.activeCount}
                    </span>
                  )}
                  {active && sidebarExpanded && item.id !== "cctv" && (
                    <div className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                  )}
=======
                  <span
                    className={`ml-3.5 whitespace-nowrap overflow-hidden tracking-wide drop-shadow-sm transition-all duration-300 ease-in-out ${
                      sidebarExpanded
                        ? "max-w-[140px] opacity-100 translate-x-0"
                        : "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                    }`}
                  >
                    {item.label}
                  </span>
>>>>>>> fdd6855715257b11d5242fc9ae3c6e710aa57b41
                </button>
              );
            })}
          </nav>

          {/* User & Logout section */}
<<<<<<< HEAD
          <div
            className={`relative mt-auto flex shrink-0 flex-col gap-3 py-4 md:gap-5 md:py-5 ${sidebarExpanded ? "px-5" : "px-1 md:px-3"}`}
          >
            {/* Profile Container */}
            <div
              className={`flex items-center ${sidebarExpanded ? "gap-3.5" : "justify-center"} rounded-2xl p-2 cursor-pointer transition-all duration-400 border border-white/20 hover:bg-white/5 shadow-sm`}
            >
              <div className="grid size-8 shrink-0 place-items-center rounded-full text-sm md:size-[42px] md:text-base font-bold text-white bg-[#1A1F60] shadow-inner">
                A
              </div>
              {sidebarExpanded && (
                <div className="min-w-0 flex-1 text-left animate-in fade-in duration-500">
                  <div className="truncate text-[14px] font-bold text-white drop-shadow-sm">
                    Santhosh Kumar
                  </div>
                  <div className="truncate text-[11px] font-medium text-white/70 mt-0.5">Admin</div>
=======
          <div className="relative p-3 border-t border-white/10 mt-auto flex flex-col gap-1.5 z-10">
            {/* Profile Container */}
            <div
              className="flex items-center w-full rounded-lg px-2.5 py-2 cursor-pointer transition-colors hover:bg-white/10 text-white overflow-hidden"
              title={!sidebarExpanded ? "Santhosh Kumar (Admin)" : undefined}
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white bg-white/20 ring-1 ring-white/30">
                A
              </div>
              <div
                className={`ml-2.5 whitespace-nowrap overflow-hidden text-left transition-all duration-300 ease-in-out ${
                  sidebarExpanded
                    ? "max-w-[130px] opacity-100 translate-x-0"
                    : "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                }`}
              >
                <div className="truncate text-sm font-semibold text-white leading-tight">
                  Santhosh Kumar
>>>>>>> fdd6855715257b11d5242fc9ae3c6e710aa57b41
                </div>
                <div className="truncate text-xs text-white/60 leading-tight mt-0.5">
                  Admin
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
<<<<<<< HEAD
              aria-label="Logout"
              title="Logout"
=======
              type="button"
>>>>>>> fdd6855715257b11d5242fc9ae3c6e710aa57b41
              onClick={() => {
                auth.logout();
                navigate({ to: "/login" });
              }}
              className="flex items-center w-full rounded-lg px-2.5 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer overflow-hidden"
              title={!sidebarExpanded ? "Logout" : undefined}
            >
<<<<<<< HEAD
              <LogOut
                size={20}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
              {sidebarExpanded && (
                <span className="font-bold text-[15px] tracking-wide">Logout</span>
              )}
=======
              <div className="w-8 h-5 shrink-0 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <span
                className={`ml-2.5 whitespace-nowrap overflow-hidden font-medium transition-all duration-300 ease-in-out ${
                  sidebarExpanded
                    ? "max-w-[130px] opacity-100 translate-x-0"
                    : "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                }`}
              >
                Logout
              </span>
>>>>>>> fdd6855715257b11d5242fc9ae3c6e710aa57b41
            </button>
          </div>
        </aside>

        {/* =============================
        TOPBAR
        ============================= */}
        <header
<<<<<<< HEAD
          className={`fixed right-0 top-0 z-20 flex h-16 items-center justify-between px-3 md:px-8 transition-[left] duration-300 bg-white/70 backdrop-blur-2xl border-b border-border/40 shadow-sm left-[56px] ${sidebarExpanded ? "md:left-[276px]" : "md:left-[80px]"}`}
=======
          className={`fixed right-0 top-0 z-20 flex h-16 items-center justify-between px-8 transition-[left] duration-300 ease-in-out bg-white/70 backdrop-blur-2xl border-b border-border/40 shadow-sm ${sidebarExpanded ? "left-[220px]" : "left-[72px]"}`}
>>>>>>> fdd6855715257b11d5242fc9ae3c6e710aa57b41
        >
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1 text-[9px] font-bold tracking-wide bg-status-normal/10 border border-status-normal/20 text-status-normal shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-status-normal animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              LIVE
            </div>

            {/* State filter */}
            <div className="relative hidden lg:block">
              <button
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
                          s === "All States" ? TEMPLES[0] : TEMPLES.find((t) => t.state === s);
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
            <div className="relative hidden lg:block">
              <button
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
            <div className="relative">
              <button
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

          <div className="flex items-center gap-4">
            {/* Empty space that was replaced by moving filters */}

            {/* Clock + weather */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs ml-2">
              <span className="font-mono font-semibold tracking-tight text-foreground">
                {now.toLocaleTimeString("en-IN", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                -{" "}
                {now.toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>

            {/* Weather */}
            {temple && (
              <div className="hidden min-[1150px]:flex items-center gap-2 rounded-full px-4 py-2 bg-white border border-border/60 shadow-sm ml-2">
                <span className="text-[9px] font-semibold tracking-wider text-muted-foreground">
                  {temple.short}
                </span>
                <span className="text-xs font-bold text-foreground">{temple.weather}</span>
              </div>
            )}

            {/* Bell */}
            <div className="relative ml-1">
              <button
                aria-label={`Notifications, ${cctv.activeCount} active camera alerts`}
                title="Notifications"
                onClick={() => {
                  if (section === "cctv") setCctvAlertsOpen(true);
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
                  <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full text-[8px] font-bold text-white bg-primary shadow-sm border border-white">
                    {cctv.activeCount}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl shadow-xl bg-white border border-border/50">
                  <div className="px-5 py-3 text-[11px] font-bold tracking-tight bg-muted/40 border-b border-border/50 text-white">
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
            <div className="grid h-10 w-10 place-items-center rounded-full text-xs font-bold text-white cursor-pointer transition-all duration-300 hover:scale-105 bg-[#1A1F60] shadow-sm ml-1 border border-white/20">
              A
            </div>
          </div>
        </header>

<<<<<<< HEAD
        <main className="ml-[56px] min-h-dvh min-w-0 flex-1 pt-16 md:ml-0">
          <div className="relative mx-auto min-h-[calc(100dvh-4rem)] w-full max-w-[1600px] px-3 py-5 sm:p-6 lg:p-8">
            {/* Temple switch shimmer */}
            {shimmer && (
              <div
                className={`fixed top-16 right-0 bottom-0 z-50 left-[56px] ${sidebarExpanded ? "md:left-[276px]" : "md:left-[80px]"} flex items-center justify-center backdrop-blur-md animate-in fade-in duration-200 bg-background/70`}
=======
        <main
          className={`flex-1 pt-16 min-w-0 max-w-full overflow-x-hidden transition-[margin-left,max-width] duration-300 ease-in-out ${sidebarExpanded ? "ml-[220px] max-w-[calc(100vw-220px)]" : "ml-[72px] max-w-[calc(100vw-72px)]"}`}
        >
          <div className="relative p-4 sm:p-6 lg:p-7 min-h-[calc(100vh-4rem)] w-full max-w-full overflow-x-hidden min-w-0">
            {/* Temple switch shimmer */}
            {shimmer && (
              <div
                className={`fixed top-16 right-0 bottom-0 z-50 transition-[left] duration-300 ease-in-out ${sidebarExpanded ? "left-[220px]" : "left-[72px]"} flex items-center justify-center backdrop-blur-md animate-in fade-in duration-200 bg-background/70`}
>>>>>>> fdd6855715257b11d5242fc9ae3c6e710aa57b41
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
              className={`transition-all duration-500 ${shimmer ? "opacity-30 blur-[2px] pointer-events-none translate-y-2" : "opacity-100 translate-y-0 blur-none"}`}
            >
              {temple && (
                <>
                  {section === "dashboard" && <DashboardSection temple={temple} />}
                  {section === "darshan" && <DarshanSection />}
                  {section === "heatmap" && <HeatmapSection temple={temple} />}
                  {section === "cctv" && (
                    <CctvPage
                      data={cctv}
                      now={now.getTime()}
                      user={auth.user ?? "Admin"}
                      alertsOpen={cctvAlertsOpen}
                      onAlertsOpenChange={setCctvAlertsOpen}
                    />
                  )}
                  {(section as string) === "queue" && <QueueSection />}
                  {section === "staff" && <StaffSection />}
                  {section === "operations" && <OperationsSection />}
                  {section === "parking" && <ParkingSection />}
                  {section === "donations" && <DonationSection />}
                  {section === "annadhanam" && <AnnadhanamSection temple={temple} />}
                </>
              )}
              {/* {section === "announcements" && <AnnouncementsSection />} */}
              {/* {section === "analytics" && <AnalyticsSection />} */}
              {/* {section === "emergency" && <EmergencySection />} */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
