"use client";
import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import DelayCard from "@/components/dashboard/DelayCard";
import ConflictModal from "@/components/dashboard/ConflictModal";
import GrievanceFeed from "@/components/dashboard/GrievanceFeed";
import ContractorTable from "@/components/dashboard/ContractorTable";
import CpgramsModal from "@/components/dashboard/CpgramsModal";
import {
  mockPublicWorks,
  mockContractors,
  mockGrievances,
  mockConflicts,
  mockDashboardSummary,
  PublicWork,
  SocialGrievance,
  Contractor,
  ConflictAlert,
} from "@/data/mockData";
import {
  getProjects,
  getConflicts,
  getContractors,
  getGrievances,
  getDashboardSummary,
  ApiPublicWork,
  ApiConflict,
  ApiContractor,
  ApiGrievance,
  DashboardSummary,
} from "@/lib/api";
import {
  AlertTriangle,
  Layers,
  Users,
  MessageSquare,
  TrendingUp,
  Award,
  Wifi,
  WifiOff,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Shape adapters: API types → component-compatible types
// ---------------------------------------------------------------------------

function adaptWork(w: ApiPublicWork): PublicWork {
  return { ...w, coordinates: [] };
}

function adaptContractor(c: ApiContractor): Contractor {
  return { ...c, escrow_status: c.escrow_status as Contractor["escrow_status"] };
}

function adaptGrievance(g: ApiGrievance): SocialGrievance {
  return {
    ...g,
    related_project_id: g.related_project_id ?? "",
    location_mention: g.location_mention ?? "",
    timestamp: g.timestamp ?? new Date().toISOString(),
    urgency_tier: g.urgency_tier as SocialGrievance["urgency_tier"],
  };
}

function adaptConflict(c: ApiConflict): ConflictAlert {
  return {
    id: c.id,
    road_name: c.road_name,
    departments: c.departments,
    project_ids: c.project_ids,
    severity: (c.severity === "CRITICAL" ? "CRITICAL" : "HIGH") as ConflictAlert["severity"],
    description: c.description,
  };
}

// ---------------------------------------------------------------------------
// Resilient fetch helper — silently falls back to mock on any failure
// ---------------------------------------------------------------------------

async function fetchWithFallback<T, M>(
  apiFn: () => Promise<T>,
  fallback: M,
  transform?: (data: T) => M
): Promise<{ data: M; fromApi: boolean }> {
  try {
    const raw = await apiFn();
    return { data: transform ? transform(raw) : (raw as unknown as M), fromApi: true };
  } catch {
    return { data: fallback, fromApi: false };
  }
}

// ---------------------------------------------------------------------------
// Lazy-load Leaflet map (SSR not supported)
// ---------------------------------------------------------------------------
const MapContainer = dynamic(
  () => import("@/components/dashboard/MapContainer"),
  { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
  return (
    <div className="w-full h-full rounded-xl bg-[#0D0F14] border border-[#1E2330] flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-[#3B82F6]/40 border-t-[#3B82F6] rounded-full animate-spin mx-auto" />
        <p className="text-[11px] text-[#4B5563]">Loading spatial map…</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton loaders
// ---------------------------------------------------------------------------

function StatSkeleton() {
  return (
    <div className="bg-[#0D0F14] border border-[#1E2330] rounded-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-[#1E2330] animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-2 bg-[#1E2330] rounded animate-pulse w-20" />
        <div className="h-5 bg-[#1E2330] rounded animate-pulse w-10" />
      </div>
    </div>
  );
}

function RowSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-[#1E2330]/40 animate-pulse" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  loading?: boolean;
}) {
  if (loading) return <StatSkeleton />;
  return (
    <div className="bg-[#0D0F14] border border-[#1E2330] rounded-xl p-4 flex items-center gap-3 hover:border-[#2D3748] transition-colors">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: color + "18" }}
      >
        <Icon size={16} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-[#4B5563] font-medium leading-none mb-1">{label}</p>
        <p className="text-[20px] font-bold text-white leading-none">{value}</p>
        {sub && <p className="text-[9.5px] text-[#374151] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-widest">
        {title}
      </h2>
      {count !== undefined && (
        <span className="text-[10px] text-[#374151] bg-[#13161D] border border-[#1E2330] px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// API Status pill (top-right of header area)
// ---------------------------------------------------------------------------

function ApiStatusPill({ isLive }: { isLive: boolean | null }) {
  if (isLive === null) return null;
  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[9px] font-semibold tracking-wide ${
        isLive
          ? "bg-[#10B981]/10 border-[#10B981]/25 text-[#10B981]"
          : "bg-[#374151]/20 border-[#374151]/30 text-[#6B7280]"
      }`}
    >
      {isLive ? <Wifi size={9} /> : <WifiOff size={9} />}
      {isLive ? "LIVE API" : "MOCK DATA"}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedWork, setSelectedWork] = useState<PublicWork | null>(null);
  const [cpgramsGrievance, setCpgramsGrievance] = useState<SocialGrievance | null>(null);

  // ── Data state (initialised with mock data immediately) ──
  const [projects, setProjects] = useState<PublicWork[]>(mockPublicWorks);
  const [conflicts, setConflicts] = useState<ConflictAlert[]>(mockConflicts);
  const [contractors, setContractors] = useState<Contractor[]>(mockContractors);
  const [grievances, setGrievances] = useState<SocialGrievance[]>(mockGrievances);
  const [summary, setSummary] = useState<DashboardSummary>(mockDashboardSummary);

  // ── Loading: only true while we're *upgrading* from mock to live data ──
  const [loading, setLoading] = useState(true);

  // ── Track whether we're showing live API data or mock fallback ──
  const [isLiveData, setIsLiveData] = useState<boolean | null>(null);

  // ── Fetch live data, fall back to mock on failure ──
  useEffect(() => {
    let liveCount = 0;

    Promise.all([
      fetchWithFallback(
        getProjects,
        mockPublicWorks,
        (data: ApiPublicWork[]) => data.map(adaptWork)
      ),
      fetchWithFallback(
        getConflicts,
        mockConflicts,
        (data: ApiConflict[]) => data.map(adaptConflict)
      ),
      fetchWithFallback(
        getContractors,
        mockContractors,
        (data: ApiContractor[]) => data.map(adaptContractor)
      ),
      fetchWithFallback(
        getGrievances,
        mockGrievances,
        (data: ApiGrievance[]) => data.map(adaptGrievance)
      ),
      fetchWithFallback(
        getDashboardSummary,
        mockDashboardSummary
      ),
    ]).then(([proj, conf, cont, griev, summ]) => {
      setProjects(proj.data);
      setConflicts(conf.data);
      setContractors(cont.data);
      setGrievances(griev.data);
      setSummary(summ.data as DashboardSummary);

      liveCount = [proj, conf, cont, griev, summ].filter((r) => r.fromApi).length;
      setIsLiveData(liveCount > 0);
      setLoading(false);
    });
  }, []);

  const handleSelectWork = useCallback((work: PublicWork) => {
    setSelectedWork(work);
  }, []);

  const handleFileCpgrams = useCallback((g: SocialGrievance) => {
    setCpgramsGrievance(g);
  }, []);

  const highestRiskProject = [...projects].sort(
    (a, b) => b.delay_risk_score - a.delay_risk_score
  )[0];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080A0F]">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header row with API status pill */}
        <div className="flex items-center justify-between pr-4">
          <div className="flex-1 min-w-0">
            <Header activeTab={activeTab} />
          </div>
          <ApiStatusPill isLive={isLiveData} />
        </div>

        {/* Dashboard body */}
        <main className="flex-1 overflow-hidden p-4 gap-4 grid grid-cols-12 grid-rows-[auto_1fr_1fr] min-h-0">
          {/* ── Row 1: Stat cards ── */}
          <div className="col-span-12 grid grid-cols-6 gap-3">
            <StatCard
              icon={Layers}
              label="Active Excavations"
              value={summary.total_projects}
              sub="Greater Chennai"
              color="#3B82F6"
              loading={loading}
            />
            <StatCard
              icon={AlertTriangle}
              label="Critical Overlaps"
              value={summary.critical_overlaps}
              sub="Requires joint permit"
              color="#EF4444"
              loading={loading}
            />
            <StatCard
              icon={TrendingUp}
              label="Moderate Risk"
              value={summary.moderate_risk}
              sub="40–75% delay risk"
              color="#F59E0B"
              loading={loading}
            />
            <StatCard
              icon={Layers}
              label="On Schedule"
              value={summary.on_schedule}
              sub="< 40% delay risk"
              color="#10B981"
              loading={loading}
            />
            <StatCard
              icon={MessageSquare}
              label="Live Grievances"
              value={summary.total_grievances}
              sub={`${summary.high_urgency_grievances} HIGH urgency`}
              color="#8B5CF6"
              loading={loading}
            />
            <StatCard
              icon={Award}
              label="Avg Contractor CRI"
              value={`${summary.avg_contractor_cri}`}
              sub="Out of 100"
              color="#06B6D4"
              loading={loading}
            />
          </div>

          {/* ── Row 2: Map (7 cols) + Right panel (5 cols) ── */}
          <div className="col-span-7 row-span-2 min-h-0">
            <MapContainer
              works={projects}
              conflicts={conflicts}
              onSelectWork={handleSelectWork}
              loading={loading}
            />
          </div>

          {/* Right panel top: Conflict Alerts */}
          <div className="col-span-5 min-h-0 overflow-y-auto bg-[#0D0F14] border border-[#1E2330] rounded-xl p-4">
            <SectionHeader title="Spatial Conflict Alerts" count={conflicts.length} />
            {loading ? (
              <RowSkeleton rows={2} />
            ) : (
              <ConflictModal conflicts={conflicts} works={projects} />
            )}

            {selectedWork && (
              <div className="mt-4">
                <SectionHeader title="Selected Project — Delay Analysis" />
                <DelayCard work={selectedWork} />
              </div>
            )}

            {!selectedWork && !loading && highestRiskProject && (
              <div className="mt-4">
                <SectionHeader title="Highest Risk Project" />
                <DelayCard work={highestRiskProject} />
              </div>
            )}

            {!selectedWork && loading && (
              <div className="mt-4">
                <SectionHeader title="Highest Risk Project" />
                <RowSkeleton rows={4} />
              </div>
            )}
          </div>

          {/* ── Row 3: Grievances (5 cols) ── */}
          <div className="col-span-5 min-h-0 overflow-y-auto bg-[#0D0F14] border border-[#1E2330] rounded-xl p-4 flex flex-col">
            <SectionHeader title="Live Grievance Feed" count={grievances.length} />
            <div className="flex-1 min-h-0">
              {loading ? (
                <RowSkeleton rows={4} />
              ) : (
                <GrievanceFeed grievances={grievances} onFileCpgrams={handleFileCpgrams} />
              )}
            </div>
          </div>
        </main>

        {/* Contractor table — fixed bottom bar */}
        <div className="flex-shrink-0 border-t border-[#1E2330] bg-[#0D0F14] px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-widest flex items-center gap-2">
              <Users size={12} />
              Contractor Scorecard
            </h2>
            <span className="text-[10px] text-[#374151]">
              {loading
                ? "Loading…"
                : `${contractors.length} contractors · Sorted by CRI`}
            </span>
          </div>
          {loading ? <RowSkeleton rows={2} /> : <ContractorTable contractors={contractors} />}
        </div>
      </div>

      {/* CPGRAMS Modal */}
      <CpgramsModal
        grievance={cpgramsGrievance}
        onClose={() => setCpgramsGrievance(null)}
      />
    </div>
  );
}
